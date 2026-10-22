import { SolicitarRecuperacionUseCase } from '../../../src/application/usecase/auth/SolicitarRecuperacionUseCase';
import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { PrismaCodigoVerificacionRepository } from '../../../src/infrastructure/repository/PrismaCodigoVerificacionRepository';
import { RandomCodeGenerator } from '../../../src/infrastructure/service/RandomCodeGenerator';
import { PrismaTransactionManager } from '../../../src/infrastructure/database/PrismaTransactionManager';
import { prisma } from '../../../src/infrastructure/database/prisma';
import { CodigoVerificacion } from '../../../src/domain/entity/CodigoVerificacion';
import { EmailSender } from '../../../src/application/port/EmailSender';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { UsuarioNoEncontradoException } from '../../../src/application/exception/UsuarioNoEncontradoException';
import { CorreoNoVerificadoException } from '../../../src/application/exception/CorreoNoVerificadoException';
import { EmailNoEnviadoException } from '../../../src/application/exception/EmailNoEnviadoException';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

describe('SolicitarRecuperacionUseCase Integration Tests', () => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const codigoRepository = new PrismaCodigoVerificacionRepository();
  const codeGenerator = new RandomCodeGenerator();
  const transactionManager = new PrismaTransactionManager();
  let emailSender: EmailSender;
  let useCase: SolicitarRecuperacionUseCase;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
    emailSender = {
      enviarEmail: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new SolicitarRecuperacionUseCase(
      usuarioRepository,
      codigoRepository,
      codeGenerator,
      emailSender,
      transactionManager
    );
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  const seedUsuario = async (correo: string, verificado: boolean = true) => {
    const usuario = new Usuario(
      0,
      'hashed_pwd',
      'Maria',
      'Lopez',
      correo,
      '71234567',
      '944332211',
      Genero.FEMENINO,
      new Date('1993-08-20'),
      Rol.PACIENTE,
      verificado
    );
    return await usuarioRepository.save(usuario);
  };

  it('debe generar código de recuperación en BD y enviar correo para un usuario verificado', async () => {
    const correo = 'recovery@test.com';
    await seedUsuario(correo, true);

    await useCase.ejecutar({ correo });

    expect(emailSender.enviarEmail).toHaveBeenCalledTimes(1);
    const emailCallArgs = (emailSender.enviarEmail as jest.Mock).mock.calls[0];
    expect(emailCallArgs[0]).toBe(correo);

    const match = emailCallArgs[2].match(/(\d{6})/);
    const codigoGenerado = match ? match[1] : '';
    expect(codigoGenerado).not.toBe('');

    const codigoDb = await codigoRepository.findByCorreoYCodigo(correo, codigoGenerado);
    expect(codigoDb).not.toBeNull();
    expect(codigoDb?.correo).toBe(correo);
  });

  it('debe lanzar UsuarioNoEncontradoException si el correo no existe en la BD', async () => {
    await expect(useCase.ejecutar({ correo: 'inexistente@test.com' })).rejects.toThrow(
      UsuarioNoEncontradoException
    );
  });

  it('debe lanzar CorreoNoVerificadoException si la cuenta no está verificada', async () => {
    const correo = 'unverified_recovery@test.com';
    await seedUsuario(correo, false);

    await expect(useCase.ejecutar({ correo })).rejects.toThrow(CorreoNoVerificadoException);
  });

  it('debe conservar el código anterior si falla el envío del correo', async () => {
    const correo = 'recovery_fail@test.com';
    await seedUsuario(correo, true);
    await codigoRepository.save(
      new CodigoVerificacion(0, correo, '111111', new Date(Date.now() + 5 * 60 * 1000))
    );

    (emailSender.enviarEmail as jest.Mock).mockRejectedValueOnce(
      new Error('SMTP no disponible')
    );

    await expect(useCase.ejecutar({ correo })).rejects.toThrow(EmailNoEnviadoException);

    expect(await codigoRepository.findByCorreoYCodigo(correo, '111111')).not.toBeNull();
    expect(await prisma.codigoVerificacion.count({ where: { correo } })).toBe(1);
  });
});
