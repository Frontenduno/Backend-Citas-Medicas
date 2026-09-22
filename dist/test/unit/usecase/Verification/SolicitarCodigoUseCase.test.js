"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SolicitarCodigoUseCase_1 = require("../../../../src/application/usecases/Verification/SolicitarCodigoUseCase");
const ValidacionException_1 = require("../../../../src/application/exception/ValidacionException");
const CorreoRegistradoException_1 = require("../../../../src/application/exception/CorreoRegistradoException");
const CorreoYaVerificadoException_1 = require("../../../../src/application/exception/CorreoYaVerificadoException");
const DemasiadasSolicitudesException_1 = require("../../../../src/application/exception/DemasiadasSolicitudesException");
const DemasiadosIntentosException_1 = require("../../../../src/application/exception/DemasiadosIntentosException");
const CodigoVerificacion_1 = require("../../../../src/domain/entity/CodigoVerificacion");
describe('SolicitarCodigoUseCase', () => {
    let useCase;
    let usuarioRepo;
    let codigoRepo;
    let codeGen;
    let emailSender;
    let logger;
    let metrics;
    beforeEach(() => {
        usuarioRepo = { findByEmail: jest.fn() };
        codigoRepo = {
            contarPorIp: jest.fn(),
            buscarUltimoPendiente: jest.fn(),
            contarRecientes: jest.fn(),
            invalidarPendientes: jest.fn(),
            crear: jest.fn()
        };
        codeGen = { generar: jest.fn() };
        emailSender = { enviarCodigoVerificacion: jest.fn() };
        logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
        metrics = { incrementar: jest.fn(), observar: jest.fn() };
        useCase = new SolicitarCodigoUseCase_1.SolicitarCodigoUseCase(usuarioRepo, codigoRepo, codeGen, emailSender, logger, metrics);
    });
    it('envía código con datos válidos', async () => {
        codigoRepo.contarPorIp.mockResolvedValue(0);
        usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false, nombres: 'Juan' });
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
            .rejects.toThrow(ValidacionException_1.ValidacionException);
    });
    it('rechaza correo no registrado', async () => {
        codigoRepo.contarPorIp.mockResolvedValue(0);
        usuarioRepo.findByEmail.mockResolvedValue(null);
        await expect(useCase.execute({ correo: 'test@mail.com', ip: null, userAgent: null }))
            .rejects.toThrow(CorreoRegistradoException_1.CorreoRegistradoException);
    });
    it('rechaza correo ya verificado', async () => {
        codigoRepo.contarPorIp.mockResolvedValue(0);
        usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: true });
        await expect(useCase.execute({ correo: 'test@mail.com', ip: null, userAgent: null }))
            .rejects.toThrow(CorreoYaVerificadoException_1.CorreoYaVerificadoException);
    });
    it('rechaza si IP supera rate limit', async () => {
        codigoRepo.contarPorIp.mockResolvedValueOnce(3); // 10 min
        await expect(useCase.execute({ correo: 'test@mail.com', ip: '127.0.0.1', userAgent: null }))
            .rejects.toThrow(DemasiadasSolicitudesException_1.DemasiadasSolicitudesException);
    });
    it('rechaza si ya solicitó hace <60s pero no está pendiente', async () => {
        codigoRepo.contarPorIp.mockResolvedValue(0);
        usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false });
        codigoRepo.buscarUltimoPendiente.mockResolvedValue(null);
        codigoRepo.contarRecientes.mockResolvedValue(1);
        await expect(useCase.execute({ correo: 'test@mail.com', ip: null, userAgent: null }))
            .rejects.toThrow(DemasiadosIntentosException_1.DemasiadosIntentosException);
    });
    it('reutiliza código si es idempotente (<30s)', async () => {
        codigoRepo.contarPorIp.mockResolvedValue(0);
        usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false });
        const codigoReciente = new CodigoVerificacion_1.CodigoVerificacion(1, 1, 'REGISTRO', 'hash', 'PENDIENTE', 0, 5, new Date(Date.now() + 15 * 60000), null, null, new Date(), null);
        codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigoReciente);
        await useCase.execute({ correo: 'test@mail.com', ip: null, userAgent: null });
        expect(codeGen.generar).not.toHaveBeenCalled();
        expect(emailSender.enviarCodigoVerificacion).not.toHaveBeenCalled();
    });
});
