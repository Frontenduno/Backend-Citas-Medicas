import { SolicitarCodigoUseCase } from '../../../../src/application/usecases/Verification/SolicitarCodigoUseCase';
import { IUsuarioRepository } from '../../../../src/domain/repository/UsuarioRepository';
import { CodigoVerificacionRepository } from '../../../../src/application/ports/CodigoVerificacionRepository';
import { CodeGenerator } from '../../../../src/application/ports/CodeGenerator';
import { EmailSender } from '../../../../src/application/ports/EmailSender';
import { Logger } from '../../../../src/application/ports/Logger';
import { Metrics } from '../../../../src/application/ports/Metrics';
import { ValidacionException } from '../../../../src/application/exception/ValidacionException';
import { CorreoRegistradoException } from '../../../../src/application/exception/CorreoRegistradoException';
import { CorreoYaVerificadoException } from '../../../../src/application/exception/CorreoYaVerificadoException';
import { DemasiadasSolicitudesException } from '../../../../src/application/exception/DemasiadasSolicitudesException';
import { DemasiadosIntentosException } from '../../../../src/application/exception/DemasiadosIntentosException';
import { Usuario } from '../../../../src/domain/entity/Usuario';
import { CodigoVerificacion } from '../../../../src/domain/entity/CodigoVerificacion';

describe('SolicitarCodigoUseCase', () => {
  let useCase: SolicitarCodigoUseCase;
  let usuarioRepo: jest.Mocked<IUsuarioRepository>;
  let codigoRepo: jest.Mocked<CodigoVerificacionRepository>;
  let codeGen: jest.Mocked<CodeGenerator>;
  let emailSender: jest.Mocked<EmailSender>;
  let logger: jest.Mocked<Logger>;
  let metrics: jest.Mocked<Metrics>;

  beforeEach(() => {
    usuarioRepo = { findByEmail: jest.fn() } as any;
    codigoRepo = {
      contarPorIp: jest.fn(),
      buscarUltimoPendiente: jest.fn(),
      contarRecientes: jest.fn(),
      invalidarPendientes: jest.fn(),
      crear: jest.fn()
    } as any;
    codeGen = { generar: jest.fn() } as any;
    emailSender = { enviarCodigoVerificacion: jest.fn() } as any;
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    metrics = { incrementar: jest.fn(), observar: jest.fn() };

    useCase = new SolicitarCodigoUseCase(usuarioRepo, codigoRepo, codeGen, emailSender, logger, metrics);
  });

  it('envía código con datos válidos', async () => {
    codigoRepo.contarPorIp.mockResolvedValue(0);
    usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false, nombres: 'Juan' } as Usuario);
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(null);
    codigoRepo.contarRecientes.mockResolvedValue(0);
    codeGen.generar.mockReturnValue({ codigo: '123456', codigoHash: 'hash' });

    await useCase.execute({ correo: 'test@mail.com', ip: '127.0.0.1', userAgent: 'Jest' });

    expect(emailSender.enviarCodigoVerificacion).toHaveBeenCalledWith({
      destinatario: 'test@mail.com',
      nombre: 'Juan',
      codigo: '123456'
    });
    expect(metrics.incrementar).toHaveBeenCalledWith('verificacion.solicitada');
  });

  it('rechaza correo inválido', async () => {
    await expect(useCase.execute({ correo: 'invalid', ip: null, userAgent: null }))
      .rejects.toThrow(ValidacionException);
  });

  it('rechaza correo no registrado', async () => {
    codigoRepo.contarPorIp.mockResolvedValue(0);
    usuarioRepo.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute({ correo: 'test@mail.com', ip: null, userAgent: null }))
      .rejects.toThrow(CorreoRegistradoException);
  });

  it('rechaza correo ya verificado', async () => {
    codigoRepo.contarPorIp.mockResolvedValue(0);
    usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: true } as Usuario);
    await expect(useCase.execute({ correo: 'test@mail.com', ip: null, userAgent: null }))
      .rejects.toThrow(CorreoYaVerificadoException);
  });

  it('rechaza si IP supera rate limit', async () => {
    codigoRepo.contarPorIp.mockResolvedValueOnce(3); // 10 min
    await expect(useCase.execute({ correo: 'test@mail.com', ip: '127.0.0.1', userAgent: null }))
      .rejects.toThrow(DemasiadasSolicitudesException);
  });

  it('rechaza si ya solicitó hace <60s pero no está pendiente', async () => {
    codigoRepo.contarPorIp.mockResolvedValue(0);
    usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false } as Usuario);
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(null);
    codigoRepo.contarRecientes.mockResolvedValue(1);

    await expect(useCase.execute({ correo: 'test@mail.com', ip: null, userAgent: null }))
      .rejects.toThrow(DemasiadosIntentosException);
  });

  it('reutiliza código si es idempotente (<30s)', async () => {
    codigoRepo.contarPorIp.mockResolvedValue(0);
    usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false } as Usuario);
    
    const codigoReciente = new CodigoVerificacion(1, 1, 'REGISTRO', 'hash', 'PENDIENTE', 0, 5, new Date(Date.now() + 15*60000), null, null, new Date(), null);
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigoReciente);

    await useCase.execute({ correo: 'test@mail.com', ip: null, userAgent: null });

    expect(codeGen.generar).not.toHaveBeenCalled();
    expect(emailSender.enviarCodigoVerificacion).not.toHaveBeenCalled();
  });
});

