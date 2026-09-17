import { Request, Response } from "express";
import { CreateCitaUseCase } from "../../application/usecases/citas/CreateCitaUseCase";
import { GetCitaByIdUseCase } from "../../application/usecases/citas/GetCitaByIdUseCase";
import { GetCitasByPacienteUseCase } from "../../application/usecases/citas/GetCitasByPacienteUseCase";
import { GetCitasByMedicoUseCase } from "../../application/usecases/citas/GetCitasByMedicoUseCase";
import { GetCitasByFechaUseCase } from "../../application/usecases/citas/GetCitasByFechaUseCase";
import { UpdateEstadoCitaUseCase } from "../../application/usecases/citas/UpdateEstadoCitaUseCase";
import { DeleteCitaUseCase } from "../../application/usecases/citas/DeleteCitaUseCase";
import { CheckDisponibilidadUseCase } from "../../application/usecases/citas/CheckDisponibilidadUseCase";

export class CitaController {
  constructor(
    private readonly createCitaUseCase: CreateCitaUseCase,
    private readonly getCitaByIdUseCase: GetCitaByIdUseCase,
    private readonly getCitasByPacienteUseCase: GetCitasByPacienteUseCase,
    private readonly getCitasByMedicoUseCase: GetCitasByMedicoUseCase,
    private readonly getCitasByFechaUseCase: GetCitasByFechaUseCase,
    private readonly updateEstadoCitaUseCase: UpdateEstadoCitaUseCase,
    private readonly deleteCitaUseCase: DeleteCitaUseCase,
    private readonly checkDisponibilidadUseCase: CheckDisponibilidadUseCase,
  ) {}

  createCita = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pacienteId, medicoId, fecha, hora, motivo } = req.body;
      const resultado = await this.createCitaUseCase.execute({
        pacienteId: Number(pacienteId),
        medicoId: Number(medicoId),
        fecha,
        hora,
        motivo,
      });
      res.status(201).json(resultado);
    } catch (error: any) {
      if (error.statusCode === 409) {
        res.status(409).json({ error: error.message });
        return;
      }
      if (error.message.includes("Campos requeridos")) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error al crear cita:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  getCitaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const resultado = await this.getCitaByIdUseCase.execute(id);
      if (!resultado) {
        res.status(404).json({ error: "Cita no encontrada" });
        return;
      }
      res.json(resultado);
    } catch (error) {
      console.error("Error al buscar cita:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  getCitasByPaciente = async (req: Request, res: Response): Promise<void> => {
    try {
      const pacienteId = Number(req.params.pacienteId);
      const citas = await this.getCitasByPacienteUseCase.execute(pacienteId);
      res.json(citas);
    } catch (error) {
      console.error("Error al buscar citas del paciente:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  getCitasByMedico = async (req: Request, res: Response): Promise<void> => {
    try {
      const medicoId = Number(req.params.medicoId);
      const citas = await this.getCitasByMedicoUseCase.execute(medicoId);
      res.json(citas);
    } catch (error) {
      console.error("Error al buscar citas del médico:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  getCitasByFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const fecha = String(req.params.fecha);
      const citas = await this.getCitasByFechaUseCase.execute(fecha);
      res.json(citas);
    } catch (error) {
      console.error("Error al buscar citas por fecha:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  updateEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const idTicketCita = Number(req.params.id);
      const { estado } = req.body;

      const actualizado = await this.updateEstadoCitaUseCase.execute({
        idTicketCita,
        estado,
      });

      if (!actualizado) {
        res.status(404).json({ error: "Ticket de cita no encontrado" });
        return;
      }

      res.json({ message: "Estado actualizado correctamente", estado });
    } catch (error: any) {
      if (error.message.includes("Estado inválido")) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error al actualizar estado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  deleteCita = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const eliminado = await this.deleteCitaUseCase.execute(id);
      if (!eliminado) {
        res.status(404).json({ error: "Cita no encontrada" });
        return;
      }
      res.json({ message: "Cita eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  checkDisponibilidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const medicoId = Number(req.params.medicoId);
      const fecha = String(req.params.fecha);
      const hora = String(req.params.hora);
      const resultado = await this.checkDisponibilidadUseCase.execute(
        medicoId,
        fecha,
        hora,
      );
      res.json(resultado);
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}
