"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPacienteController = createPacienteController;
const ContactoEmergencia_1 = require("../../domain/entity/ContactoEmergencia");
function createPacienteController(registrarContactoUseCase, jwtGenerator) {
    async function registrarContacto(req, res) {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    success: false,
                    body: null,
                    message: "Token no proporcionado",
                });
            }
            let payload;
            try {
                payload = jwtGenerator.verificarToken(token);
            }
            catch {
                return res.status(401).json({
                    success: false,
                    body: null,
                    message: "Token inválido o expirado",
                });
            }
            const idUsuario = payload.id;
            const { telefono, correo, nombres, apellidos, parentesco } = req.body;
            const newContacto = new ContactoEmergencia_1.ContactoEmergencia(null, telefono, correo, nombres, apellidos, parentesco, null);
            await registrarContactoUseCase.execute(newContacto, idUsuario);
            res.status(201).json({
                success: true,
                body: null,
                message: "Contacto de Emergencia Registrado Exitosamente",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                body: null,
                message: "Error interno del servidor",
            });
        }
    }
    return { registrarContacto };
}
