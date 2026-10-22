import { ReenviarCodigoUseCase } from '../../../src/application/usecase/auth/ReenviarCodigoUseCase';
import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { PrismaCodigoVerificacionRepository } from '../../../src/infrastructure/repository/PrismaCodigoVerificacionRepository';
import { RandomCodeGenerator } from '../../../src/infrastructure/service/RandomCodeGenerator';
import { PrismaTransactionManager } from '../../../src/infrastructure/database/PrismaTransactionManager';
import { prisma } from '../../../src/infrastructure/database/prisma';
import { EmailSender } from '../../../src/application/port/EmailSender';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { CodigoVerificacion } from '../../../src/domain/entity/CodigoVerificacion';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { UsuarioNoEncontradoException } from '../../../src/application/exception/UsuarioNoEncontradoException';
import { UsuarioYaVerificadoException } from '../../../src/application/exception/UsuarioYaVerificadoException';
import { EmailNoEnviadoException } from '../../../src/application/exception/EmailNoEnviadoException';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

describe('ReenviarCodigoUseCase Integration Tests', () => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const codigoRepository = new PrismaCodigoVerificacionRepository();
  const codeGenerator = new RandomCodeGenerator();
  const transactionManager = new PrismaTransactionManager();
  let emailSender: EmailSender;
  let useCase: ReenviarCodigoUseCase;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
    emailSender = {
      enviarEmail: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new ReenviarCodigoUseCase(
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

  const seedUsuario = async (correo: string, verificado: boolean = false) => {
    const usuario = new Usuario(
      0,
      'hashed_pwd',
      'Pedro',
      'Navaja',
      correo,
      '87654321',
      '933221100',
      Genero.MASCULINO,
      new Date('1988-10-05'),
      Rol.PACIENTE,
      verificado
    );
    return await usuarioRepository.save(usuario);
  };

  it('debe reemplazar cualquier código anterior en la BD y enviar uno nuevo al usuario no verificado', async () => {
    const correo = 'resend@test.com';
    await seedUsuario(correo, false);

    // Save old code
    await codigoRepository.save(
      new CodigoVerificacion(0, correo, '111111', new Date(Date.now() + 5 * 60 * 1000))
    );

    await useCase.ejecutar({ correo });

    // Verify old code was deleted
    const viejoEnDb = await codigoRepository.findByCorreoYCodigo(correo, '111111');
    expect(viejoEnDb).toBeNull();

    // Verify new code was sent
    expect(emailSender.enviarEmail).toHaveBeenCalledTimes(1);
    const emailCallArgs = (emailSender.enviarEmail as jest.Mock).mock.calls[0];
    const match = emailCallArgs[2].match(/(\d{6})/);
    const nuevoCodigo = match ? match[1] : '';

    const nuevoEnDb = await codigoRepository.findByCorreoYCodigo(correo, nuevoCodigo);
    expect(nuevoEnDb).not.toBeNull();
  });

  it('debe lanzar UsuarioNoEncontradoException si el usuario no existe', async () => {
    await expect(useCase.ejecutar({ correo: 'inexistente@test.com' })).rejects.toThrow(
      UsuarioNoEncontradoException
    );
  });

  it('debe lanzar UsuarioYaVerificadoException si el usuario ya está verificado', async () => {
    const correo = 'already_verified@test.com';
    await seedUsuario(correo, true);

    await expect(useCase.ejecutar({ correo })).rejects.toThrow(UsuarioYaVerificadoException);
  });

  it('debe conservar el código anterior si falla el envío del correo', async () => {
    const correo = 'resend_fail@test.com';
    await seedUsuario(correo, false);
    await codigoRepository.save(
      new CodigoVerificacion(0, correo, '111111', new Date(Date.now() + 5 * 60 * 1000))
    );

    (emailSender.enviarEmail as jest.Mock).mockRejectedValueOnce(
      new Error('SMTP no disponible')
    );

    await expect(useCase.ejecutar({ correo })).rejects.toThrow(EmailNoEnviadoException);

    // El rollback conserva el código previo y no deja un código nuevo huérfano
    expect(await codigoRepository.findByCorreoYCodigo(correo, '111111')).not.toBeNull();
    expect(await prisma.codigoVerificacion.count({ where: { correo } })).toBe(1);
  });
});
