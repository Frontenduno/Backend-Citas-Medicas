import { RegistrarContactoEmergenciaUseCase } from "../../application/usecases/Paciente/RegistrarContactoEmergenciaUseCase";
import { Request, Response } from "express";
import { ContactoEmergencia } from "../../domain/entity/ContactoEmergencia";

export function createPacienteController(
  registrarContactoUseCase: RegistrarContactoEmergenciaUseCase,
) {
  async function registrarContacto(req: Request, res: Response) {
    try {

      //corregir
      const pacienteId = req.cookies.token;

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

      await registrarContactoUseCase.execute(newContacto, pacienteId);

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

  return {registrarContacto}
}
