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

/**
 * Tests focused on side‑effects (logger & metrics) during the execution of
 * SolicitarCodigoUseCase. These complement the functional tests that already
 * exist in `SolicitarCodigoUseCase.test.ts`.
 */

describe('SolicitarCodigoUseCase – comportamiento de logs y métricas', () => {
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
      crear: jest.fn(),
    } as any;
    codeGen = { generar: jest.fn() } as any;
    emailSender = { enviarCodigoVerificacion: jest.fn() } as any;
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    metrics = { incrementar: jest.fn(), observar: jest.fn() } as any;

    useCase = new SolicitarCodigoUseCase(
      usuarioRepo,
      codigoRepo,
      codeGen,
      emailSender,
      logger,
      metrics,
    );
  });

  it('registra log info y metric al enviar código exitosamente', async () => {
    codigoRepo.contarPorIp.mockResolvedValue(0);
    usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 10, correoVerificado: false, nombres: 'Ana' } as Usuario);
    codigoRepo.buscarUltimoPendiente.mockResolvedValue(null);
    codigoRepo.contarRecientes.mockResolvedValue(0);
    codeGen.generar.mockReturnValue({ codigo: '123456', codigoHash: 'hash' });

    await useCase.execute({ correo: 'ana@mail.com', ip: '1.2.3.4', userAgent: 'jest' });

    // El logger debe incluir el correo ofuscado
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('an*@mail.com'));
    expect(metrics.incrementar).toHaveBeenCalledWith('verificacion.solicitada');
  });

  it('registra metric de fallo cuando se supera el rate‑limit', async () => {
    codigoRepo.contarPorIp.mockResolvedValueOnce(4); // superado
    await expect(
      useCase.execute({ correo: 'test@mail.com', ip: '1.2.3.4', userAgent: null })
    ).rejects.toThrow(DemasiadasSolicitudesException);

    expect(metrics.incrementar).toHaveBeenCalledWith('verificacion.fallida');
    expect(logger.warn).toHaveBeenCalled();
  });
});
