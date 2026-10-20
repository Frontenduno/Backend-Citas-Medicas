import { Response } from 'express';
import { PacienteController } from '../../../../../src/presenter/rest/controller/PacienteController';
import { ListarCitasPacienteUseCase } from '../../../../../src/application/usecase/paciente/ListarCitasPacienteUseCase';
import { AuthenticatedRequest } from '../../../../../src/presenter/rest/middleware/AuthMiddleware';
import { PacienteNoEncontradoException } from '../../../../../src/application/exception/PacienteNoEncontradoException';
import { BaseException } from '../../../../../src/application/exception/BaseException';
import { crearDetalleCitaPaciente } from '../../../helpers/fixtures';

describe('PacienteController Unit Tests', () => {
  let listarCitasUseCase: jest.Mocked<ListarCitasPacienteUseCase>;
  let controller: PacienteController;

  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  const ID_USUARIO = '7';

  beforeEach(() => {
    listarCitasUseCase = { ejecutar: jest.fn() } as any;

    controller = new PacienteController(listarCitasUseCase);

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('listarCitas', () => {
    it('debe retornar 200 con la lista de citas', async () => {
      const citas = [
        crearDetalleCitaPaciente({ idCita: 1 }),
        crearDetalleCitaPaciente({ idCita: 2, codigoTicket: 'TK-20261020-002' }),
      ];
      mockReq = {
        usuario: { correo: 'juan@example.com', idUsuario: ID_USUARIO, rol: 'PACIENTE' },
        query: {},
      };
      listarCitasUseCase.ejecutar.mockResolvedValue(citas);

      await controller.listarCitas(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(listarCitasUseCase.ejecutar).toHaveBeenCalledWith(7, {
        medicoId: undefined,
        especialidadId: undefined,
        fecha: undefined,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Citas obtenidas exitosamente',
        data: citas,
      });
    });

    it('debe pasar los filtros de query params al use case', async () => {
      mockReq = {
        usuario: { correo: 'juan@example.com', idUsuario: ID_USUARIO, rol: 'PACIENTE' },
        query: {
          medicoId: '3',
          especialidadId: '1',
          fecha: '2026-10-20',
        },
      };
      listarCitasUseCase.ejecutar.mockResolvedValue([]);

      await controller.listarCitas(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(listarCitasUseCase.ejecutar).toHaveBeenCalledWith(7, {
        medicoId: 3,
        especialidadId: 1,
        fecha: new Date('2026-10-20'),
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debe retornar 404 si el usuario no tiene perfil de paciente', async () => {
      mockReq = {
        usuario: { correo: 'juan@example.com', idUsuario: ID_USUARIO, rol: 'PACIENTE' },
        query: {},
      };
      listarCitasUseCase.ejecutar.mockRejectedValue(new PacienteNoEncontradoException());

      await controller.listarCitas(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'El usuario no tiene un perfil de paciente asociado',
      });
    });

    it('debe retornar 400 si el use case lanza una BaseException', async () => {
      mockReq = {
        usuario: { correo: 'juan@example.com', idUsuario: ID_USUARIO, rol: 'PACIENTE' },
        query: {},
      };
      listarCitasUseCase.ejecutar.mockRejectedValue(new BaseException('Filtro inválido'));

      await controller.listarCitas(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Filtro inválido' });
    });

    it('debe retornar 500 si ocurre un error inesperado', async () => {
      mockReq = {
        usuario: { correo: 'juan@example.com', idUsuario: ID_USUARIO, rol: 'PACIENTE' },
        query: {},
      };
      listarCitasUseCase.ejecutar.mockRejectedValue(new Error('Fallo inesperado'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await controller.listarCitas(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });

      consoleErrorSpy.mockRestore();
    });
  });
});
