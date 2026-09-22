"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfirmarCodigoUseCase_1 = require("../../../../src/application/usecases/Verification/ConfirmarCodigoUseCase");
const ValidacionException_1 = require("../../../../src/application/exception/ValidacionException");
const CodigoExpiradoException_1 = require("../../../../src/application/exception/CodigoExpiradoException");
const CodigoIncorrectoException_1 = require("../../../../src/application/exception/CodigoIncorrectoException");
const DemasiadosIntentosException_1 = require("../../../../src/application/exception/DemasiadosIntentosException");
const Usuario_1 = require("../../../../src/domain/entity/Usuario");
const CodigoVerificacion_1 = require("../../../../src/domain/entity/CodigoVerificacion");
describe('ConfirmarCodigoUseCase', () => {
    let useCase;
    let usuarioRepo;
    let codigoRepo;
    let codeGen;
    let transaction;
    let hasher;
    let logger;
    let metrics;
    beforeEach(() => {
        usuarioRepo = { findByEmail: jest.fn(), guardar: jest.fn() };
        codigoRepo = { buscarUltimoPendiente: jest.fn(), actualizar: jest.fn() };
        codeGen = { hashear: jest.fn() };
        transaction = { withTransaction: jest.fn(cb => cb({})) };
        hasher = { encriptarContrasena: jest.fn() };
        logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
        metrics = { incrementar: jest.fn(), observar: jest.fn() };
        useCase = new ConfirmarCodigoUseCase_1.ConfirmarCodigoUseCase(usuarioRepo, codigoRepo, codeGen, transaction, hasher, logger, metrics);
    });
    it('confirma con código correcto', async () => {
        usuarioRepo.findByEmail.mockResolvedValue(new Usuario_1.Usuario(1, 'old', 'J', 'P', 't@m.c', '', '', '', '', false, null));
        const codigoPendiente = new CodigoVerificacion_1.CodigoVerificacion(1, 1, 'REGISTRO', 'hash_valido', 'PENDIENTE', 0, 5, new Date(Date.now() + 10000), null, null, new Date(), null);
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
            .rejects.toThrow(ValidacionException_1.ValidacionException);
    });
    it('rechaza contraseñas diferentes', async () => {
        await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'diferent' }))
            .rejects.toThrow(ValidacionException_1.ValidacionException);
    });
    it('rechaza código expirado', async () => {
        usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false });
        const expirado = new CodigoVerificacion_1.CodigoVerificacion(1, 1, 'REGISTRO', 'hash', 'PENDIENTE', 0, 5, new Date(Date.now() - 10000), null, null, new Date(), null);
        codigoRepo.buscarUltimoPendiente.mockResolvedValue(expirado);
        await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'password' }))
            .rejects.toThrow(CodigoExpiradoException_1.CodigoExpiradoException);
    });
    it('rechaza código incorrecto e incrementa intentos', async () => {
        usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false });
        const codigoPendiente = new CodigoVerificacion_1.CodigoVerificacion(1, 1, 'REGISTRO', 'hash_real', 'PENDIENTE', 0, 5, new Date(Date.now() + 10000), null, null, new Date(), null);
        codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigoPendiente);
        codeGen.hashear.mockReturnValue('hash_invalido');
        await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'password' }))
            .rejects.toThrow(CodigoIncorrectoException_1.CodigoIncorrectoException);
        expect(codigoRepo.actualizar).toHaveBeenCalledWith(expect.objectContaining({ intentos: 1 }));
    });
    it('rechaza si supera max intentos', async () => {
        usuarioRepo.findByEmail.mockResolvedValue({ idUsuario: 1, correoVerificado: false });
        const codigoBloqueado = new CodigoVerificacion_1.CodigoVerificacion(1, 1, 'REGISTRO', 'hash', 'PENDIENTE', 5, 5, new Date(Date.now() + 10000), null, null, new Date(), null);
        codigoRepo.buscarUltimoPendiente.mockResolvedValue(codigoBloqueado);
        await expect(useCase.execute({ correo: 't@m.c', codigo: '123456', contrasena: 'password', confirmarContrasena: 'password' }))
            .rejects.toThrow(DemasiadosIntentosException_1.DemasiadosIntentosException);
    });
});
