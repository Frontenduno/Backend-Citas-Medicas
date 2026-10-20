import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { ListarCitasPacienteUseCase } from '../../../application/usecase/paciente/ListarCitasPacienteUseCase';
import { PacienteNoEncontradoException } from '../../../application/exception/PacienteNoEncontradoException';
import { BaseException } from '../../../application/exception/BaseException';

export class PacienteController {
  constructor(
    private readonly listarCitasUseCase: ListarCitasPacienteUseCase
  ) {}

  listarCitas = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const idUsuario = Number(req.usuario?.idUsuario);

      // Extraer filtros opcionales de query params
      const filtros = {
        medicoId: req.query.medicoId ? Number(req.query.medicoId) : undefined,
        especialidadId: req.query.especialidadId ? Number(req.query.especialidadId) : undefined,
        fecha: req.query.fecha ? new Date(req.query.fecha as string) : undefined,
      };

      const citas = await this.listarCitasUseCase.ejecutar(idUsuario, filtros);

      return res.status(200).json({
        message: 'Citas obtenidas exitosamente',
        data: citas,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: Response): Response {
    if (error instanceof PacienteNoEncontradoException) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof BaseException) {
      return res.status(400).json({ message: error.message });
    }

    console.error('Error interno no controlado en PacienteController:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
