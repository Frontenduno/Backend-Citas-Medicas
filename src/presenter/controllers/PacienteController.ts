import { RegistrarContactoEmergenciaUseCase } from "../../application/usecases/Paciente/RegistrarContactoEmergenciaUseCase";
import { IJwtGenerator } from "../../application/ports/JwtGenerator";
import { Request, Response } from "express";
import { ContactoEmergencia } from "../../domain/entities/ContactoEmergencia";

export function createPacienteController(
  registrarContactoUseCase: RegistrarContactoEmergenciaUseCase,
  jwtGenerator: IJwtGenerator,
) {
  async function registrarContacto(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({
          success: false,
          body: null,
          message: "Token no proporcionado",
        });
      }

      let payload: { id: number; correo: string; rol: string };
      try {
        payload = jwtGenerator.verificarToken(token);
      } catch {
        return res.status(401).json({
          success: false,
          body: null,
          message: "Token inválido o expirado",
        });
      }

      const idUsuario = payload.id;

      const { telefono, correo, nombres, apellidos, parentesco } = req.body;

      const newContacto = new ContactoEmergencia(
        null,
        telefono,
        correo,
        nombres,
        apellidos,
        parentesco,
        null,
      );

      await registrarContactoUseCase.execute(newContacto, idUsuario);

      res.status(201).json({
        success: true,
        body: null,
        message: "Contacto de Emergencia Registrado Exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        body: null,
        message: "Error interno del servidor",
      });
    }
  }

  return { registrarContacto };
}
