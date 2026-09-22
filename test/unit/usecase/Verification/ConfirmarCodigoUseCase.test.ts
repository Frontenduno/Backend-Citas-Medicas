import { ConfirmarCodigoUseCase } from '../../../../src/application/usecases/Verification/ConfirmarCodigoUseCase';
import { IUsuarioRepository } from '../../../../src/domain/repository/UsuarioRepository';
import { CodigoVerificacionRepository } from '../../../../src/application/ports/CodigoVerificacionRepository';
import { CodeGenerator } from '../../../../src/application/ports/CodeGenerator';
import { ITransactionManager } from '../../../../src/application/ports/TransactionManager';
import { IBcryptHasher } from '../../../../src/application/ports/BcryptHasher';
import { Logger } from '../../../../src/application/ports/Logger';
import { Metrics } from '../../../../src/application/ports/Metrics';
import { ValidacionException } from '../../../../src/application/exception/ValidacionException';
import { CodigoExpiradoException } from '../../../../src/application/exception/CodigoExpiradoException';
import { CodigoIncorrectoException } from '../../../../src/application/exception/CodigoIncorrectoException';
import { DemasiadosIntentosException } from '../../../../src/application/exception/DemasiadosIntentosException';
import { Usuario } from '../../../../src/domain/entity/Usuario';
import { CodigoVerificacion } from '../../../../src/domain/entity/CodigoVerificacion';

describe('ConfirmarCodigoUseCase', () => {
  let useCase: ConfirmarCodigoUseCase;
  let usuarioRepo: jest.Mocked<IUsuarioRepository>;
  let codigoRepo: jest.Mocked<CodigoVerificacionRepository>;
  let codeGen: jest.Mocked<CodeGenerator>;
  let transaction: jest.Mocked<ITransactionManager>;
  let hasher: jest.Mocked<IBcryptHasher>;
  let logger: jest.Mocked<Logger>;
  let metrics: jest.Mocked<Metrics>;

  beforeEach(() => {
    usuarioRepo = { findByEmail: jest.fn(), guardar: jest.fn() } as any;
    codigoRepo = { buscarUltimoPendiente: jest.fn(), actualizar: jest.fn() } as any;
    codeGen = { hashear: jest.fn() } as any;
    transaction = { withTransaction: jest.fn(cb => cb({})) } as any;
    hasher = { encriptarContrasena: jest.fn() } as any;
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    metrics = { incrementar: jest.fn(), observar: jest.fn() };

    useCase = new ConfirmarCodigoUseCase(usuarioRepo, codigoRepo, codeGen, transaction, hasher, logger, metrics);
  });

  it('confirma con código correcto', async () => {
    usuarioRepo.findByEmail.mockResolvedValue(new Usuario(1, 'old', 'J', 'P', 't@m.c', '', '', '', '', false, null));
    
    const codigoPendiente = new CodigoVerificacion(1, 1, 'REGISTRO', 'hash_valido', 'PENDIENTE', 0, 5, new Date(Date.now() + 10000), null, null, new Date(), null);
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigoPendiente);
    codeGen.hashear.mockReturnValue('hash_valido');
    hasher.encriptarContrasena.mockResolvedValue('hash_new_pwd');

    await useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'password' });

    expect(codigoRepo.actualizar).toHaveBeenCalled();
    expect(usuarioRepo.guardar).toHaveBeenCalled();
    expect(metrics.incrementar).toHaveBeenCalledWith('verificacion.confirmada');
  });

  it('rechaza contraseñas <8 chars', async () => {
    await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: '1234567', confirmarContrasena: '1234567' }))
      .rejects.toThrow(ValidacionException);
  });

  it('rechaza contraseñas diferentes', async () => {
    await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'diferent' }))
      .rejects.toThrow(ValidacionException);
  });

  it('rechaza código expirado', async () => {
    usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false } as Usuario);
    const expirado = new CodigoVerificacion(1, 1, 'REGISTRO', 'hash', 'PENDIENTE', 0, 5, new Date(Date.now() - 10000), null, null, new Date(), null);
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(expirado);

    await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'password' }))
      .rejects.toThrow(CodigoExpiradoException);
  });

  it('rechaza código incorrecto e incrementa intentos', async () => {
    usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false } as Usuario);
    const codigoPendiente = new CodigoVerificacion(1, 1, 'REGISTRO', 'hash_real', 'PENDIENTE', 0, 5, new Date(Date.now() + 10000), null, null, new Date(), null);
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigoPendiente);
    codeGen.hashear.mockReturnValue('hash_invalido');

    await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'password' }))
      .rejects.toThrow(CodigoIncorrectoException);
    
    expect(codigoRepo.actualizar).toHaveBeenCalledWith(expect.objectContaining({ intentos: 1 }));
  });

  it('rechaza si supera max intentos', async () => {
    usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false } as Usuario);
    const codigoBloqueado = new CodigoVerificacion(1, 1, 'REGISTRO', 'hash', 'PENDIENTE', 5, 5, new Date(Date.now() + 10000), null, null, new Date(), null);
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigoBloqueado);

    await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'password' }))
      .rejects.toThrow(DemasiadosIntentosException);
  });
});

