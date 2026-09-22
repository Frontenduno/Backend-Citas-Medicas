"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerificationController = createVerificationController;
function createVerificationController(deps) {
    const { solicitarCodigoUseCase, confirmarCodigoUseCase } = deps;
    async function solicitar(req, res, next) {
        try {
            const { correo } = req.body;
            const ip = req.ip || req.connection.remoteAddress || null;
            const userAgent = req.headers['user-agent'] || null;
            if (!correo) {
                return res.status(400).json({ error: 'El correo es requerido' });
            }
            await solicitarCodigoUseCase.execute({ correo, ip, userAgent });
            return res.status(200).json({
                success: true,
                mensaje: 'Código enviado exitosamente',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async function confirmar(req, res, next) {
        try {
            const { correo, codigo, contrasena, confirmarContrasena } = req.body;
            if (!correo || !codigo || !contrasena || !confirmarContrasena) {
                return res.status(400).json({ error: 'Faltan campos obligatorios' });
            }
            await confirmarCodigoUseCase.execute({ correo, codigo, contrasena, confirmarContrasena });
            return res.status(200).json({
                success: true,
                mensaje: 'Correo verificado y contraseña actualizada correctamente',
            });
        }
        catch (error) {
            next(error);
        }
    }
    return { solicitar, confirmar };
}
