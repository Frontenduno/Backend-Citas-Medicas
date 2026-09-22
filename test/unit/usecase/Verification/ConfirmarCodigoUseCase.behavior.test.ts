import { ConfirmarCodigoUseCase } from '../../../../src/application/usecases/Verification/ConfirmarCodigoUseCase';
import { IUsuarioRepository } from '../../../../src/domain/repository/UsuarioRepository';
import { CodigoVerificacionRepository } from '../../../../src/application/ports/CodigoVerificacionRepository';
import { CodeGenerator } from '../../../../src/application/ports/CodeGenerator';
import { ITransactionManager } from '../../../../src/application/ports/TransactionManager';
import { IBcryptHasher } from '../../../../src/application/ports/BcryptHasher';
import { Logger } from '../../../../src/application/ports/Logger';
import { Metrics } from '../../../../src/application/ports/Metrics';
import { Usuario } from '../../../../src/domain/entity/Usuario';
import { CodigoVerificacion } from '../../../../src/domain/entity/CodigoVerificacion';
import { CorreoYaVerificadoException } from '../../../../src/application/exception/CorreoYaVerificadoException';
import { CodigoIncorrectoException } from '../../../../src/application/exception/CodigoIncorrectoException';

describe('ConfirmarCodigoUseCase - comportamiento de logs y métricas', () => {
  let useCase: ConfirmarCodigoUseCase;
  let usuarioRepo: jest.Mocked<IUsuarioRepository>;
  let codigoRepo: jest.Mocked<CodigoVerificacionRepository>;
  let codeGen: jest.Mocked<CodeGenerator>;
  let transactionManager: jest.Mocked<ITransactionManager>;
  let bcryptHasher: jest.Mocked<IBcryptHasher>;
  let logger: jest.Mocked<Logger>;
  let metrics: jest.Mocked<Metrics>;

  const usuario: Usuario = {
    idUsuario: 1,
    contrasena: 'hash',
    nombres: 'Juan',
    apellidos: 'Perez',
    correo: 'test@mail.com',
    telefono: '123',
    fechaNacimiento: new Date('1990-01-01'),
    genero: 'M',
    rol: 'Paciente',
    correoVerificado: false,
    fechaVerificacionCorreo: null,
  } as any;

  const codigo: CodigoVerificacion = new CodigoVerificacion(
    1,
    1,
    'REGISTRO',
    'hashcodigo',
    'PENDIENTE',
    0,
    5,
    new Date(Date.now() + 15 * 60000),
    null,
    null,
    new Date(),
    null
  );

  beforeEach(() => {
    usuarioRepo = {
      findByEmail: jest.fn(),
    } as any;

    codigoRepo = {
      buscarUltimoPendiente: jest.fn(),
      actualizarEstado: jest.fn(),
      marcarUsado: jest.fn(),
    } as any;

    codeGen = {
      generar: jest.fn(),
    } as any;

    transactionManager = {
      withTransaction: jest.fn(cb => cb({})),
    } as any;

    bcryptHasher = { compararContrasenas: jest.fn() } as any;

    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    metrics = { incrementar: jest.fn(), observar: jest.fn() } as any;

    useCase = new ConfirmarCodigoUseCase(
      usuarioRepo,
      codigoRepo,
      codeGen,
      transactionManager,
      bcryptHasher,
      logger,
      metrics,
    );
  });

  it('registra log info y metric al confirmar correctamente', async () => {
    // mocks
    usuarioRepo.findByEmail.mockResolvedValue(usuario);
    // Adjust mocks to match actual implementation
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigo);
    bcryptHasher.compararContrasenas.mockResolvedValue(true);
    // Include confirmarContrasena in input
    await useCase.execute({ correo: 'test@mail.com', codigo: '123456', contrasena: 'newpwd', confirmarContrasena: 'newpwd' });
    // Updated logger expectation to match obfuscation pattern (first two chars then **)
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('te**@mail.com'));
    expect(metrics.incrementar).toHaveBeenCalledWith('verificacion.confirmada');
  });

  it('lanza error y registra metric cuando el código es incorrecto', async () => {
    usuarioRepo.findByEmail.mockResolvedValue(usuario);
    // Adjust mocks for correct implementation
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigo);
    bcryptHasher.compararContrasenas.mockResolvedValue(false);

    await expect(
      useCase.execute({ correo: 'test@mail.com', codigo: '000000', contrasena: 'pwd', confirmarContrasena: 'pwd' })
    ).rejects.toBeInstanceOf(CodigoIncorrectoException);

    expect(metrics.incrementar).toHaveBeenCalledWith('verificacion.fallida', expect.any(Object));
    expect(logger.error).toHaveBeenCalled();
  });
});
