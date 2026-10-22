import { RegistrarseUseCase } from '../../../src/application/usecase/auth/RegistrarseUseCase';
import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { PrismaPacienteRepository } from '../../../src/infrastructure/repository/PrismaPacienteRepository';
import { PrismaCodigoVerificacionRepository } from '../../../src/infrastructure/repository/PrismaCodigoVerificacionRepository';
import { PrismaTransactionManager } from '../../../src/infrastructure/database/PrismaTransactionManager';
import { prisma } from '../../../src/infrastructure/database/prisma';
import { BcryptPasswordHasher } from '../../../src/infrastructure/service/BcryptPasswordHasher';
import { RandomCodeGenerator } from '../../../src/infrastructure/service/RandomCodeGenerator';
import { EmailSender } from '../../../src/application/port/EmailSender';
import { RegistrarseDTO } from '../../../src/application/dto/AuthDTO';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { UsuarioYaExisteException } from '../../../src/application/exception/UsuarioYaExisteException';
import { EmailNoEnviadoException } from '../../../src/application/exception/EmailNoEnviadoException';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

describe('RegistrarseUseCase Integration Tests', () => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const pacienteRepository = new PrismaPacienteRepository();
  const codigoRepository = new PrismaCodigoVerificacionRepository();
  const transactionManager = new PrismaTransactionManager();
  const passwordHasher = new BcryptPasswordHasher();
  const codeGenerator = new RandomCodeGenerator();
  let emailSender: EmailSender;
  let useCase: RegistrarseUseCase;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
    emailSender = {
      enviarEmail: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new RegistrarseUseCase(
      usuarioRepository,
      codigoRepository,
      passwordHasher,
      emailSender,
      codeGenerator,
      pacienteRepository,
      transactionManager
    );
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  const validDto: RegistrarseDTO = {
    nombres: 'Andrea',
    apellidos: 'Gomez',
    correo: 'andrea.gomez@test.com',
    contrasena: 'Password123!',
    documento_identidad: '72345678',
    telefono: '987111222',
    genero: Genero.FEMENINO,
    fecha_nacimiento: new Date('1995-04-12'),
    rol: Rol.PACIENTE,
  };

  it('debe registrar usuario, perfil de paciente y código de verificación en la BD de prueba', async () => {
    await useCase.ejecutar(validDto);

    // Assert user created in real DB
    const usuarioDb = await usuarioRepository.findByCorreo(validDto.correo);
    expect(usuarioDb).not.toBeNull();
    expect(usuarioDb?.nombres).toBe('Andrea');
    expect(usuarioDb?.verificado).toBe(false);

    // Assert patient profile created in real DB
    const pacienteDb = await pacienteRepository.findByUsuarioId(usuarioDb!.idUsuario);
    expect(pacienteDb).not.toBeNull();
    expect(pacienteDb?.Usuario_idUsuario).toBe(usuarioDb!.idUsuario);

    // Password must be hashed in real DB
    expect(usuarioDb?.contrasena).not.toBe(validDto.contrasena);
    const passwordValida = await passwordHasher.compararContrasena(
      validDto.contrasena,
      usuarioDb!.contrasena
    );
    expect(passwordValida).toBe(true);

    // Assert email was sent with a valid 6 digit code
    expect(emailSender.enviarEmail).toHaveBeenCalledTimes(1);
    const emailCallArgs = (emailSender.enviarEmail as jest.Mock).mock.calls[0];
    expect(emailCallArgs[0]).toBe(validDto.correo);

    // Assert code was saved in real DB
    const match = emailCallArgs[2].match(/(\d{6})/);
    const codigoEnviado = match ? match[1] : '';
    expect(codigoEnviado).not.toBe('');

    const codigoDb = await codigoRepository.findByCorreoYCodigo(validDto.correo, codigoEnviado);
    expect(codigoDb).not.toBeNull();
    expect(codigoDb?.codigo).toBe(codigoEnviado);
  });

  it('no debe crear perfil de paciente para un rol distinto de PACIENTE', async () => {
    const dtoMedico: RegistrarseDTO = {
      ...validDto,
      correo: 'medico.test@test.com',
      documento_identidad: '99887766',
      rol: Rol.MEDICO,
    };

    await useCase.ejecutar(dtoMedico);

    const usuarioDb = await usuarioRepository.findByCorreo(dtoMedico.correo);
    expect(usuarioDb).not.toBeNull();
    expect(await prisma.paciente.count()).toBe(0);
  });

  it('debe revertir todo el registro si falla el envío del correo', async () => {
    (emailSender.enviarEmail as jest.Mock).mockRejectedValueOnce(
      new Error('SMTP no disponible')
    );

    await expect(useCase.ejecutar(validDto)).rejects.toThrow(EmailNoEnviadoException);

    // Ninguna escritura debe haber sobrevivido al rollback
    expect(await usuarioRepository.findByCorreo(validDto.correo)).toBeNull();
    expect(await prisma.paciente.count()).toBe(0);
    expect(
      await prisma.codigoVerificacion.count({ where: { correo: validDto.correo } })
    ).toBe(0);
  });

  it('debe lanzar UsuarioYaExisteException si el correo ya está registrado en la BD', async () => {
    await useCase.ejecutar(validDto);

    // Attempting to register again with same email
    await expect(useCase.ejecutar(validDto)).rejects.toThrow(UsuarioYaExisteException);
  });
});
