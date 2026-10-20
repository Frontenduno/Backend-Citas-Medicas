import { ListarCitasPacienteUseCase } from "../../../../../src/application/usecase/paciente/ListarCitasPacienteUseCase";
import { PacienteNoEncontradoException } from "../../../../../src/application/exception/PacienteNoEncontradoException";
import {
  crearMockPacienteRepository,
  crearMockCitaPacienteQueryPort,
} from "../../../helpers/mocks";
import {
  crearPaciente,
  crearDetalleCitaPaciente,
} from "../../../helpers/fixtures";

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const ID_USUARIO = 7;
const ID_PACIENTE = 42;

const MEDICO_ID = 3;
const ESPECIALIDAD_ID = 1;
const FECHA_FILTRO = new Date("2026-10-20T00:00:00.000Z");

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("ListarCitasPacienteUseCase", () => {
  let pacienteRepo: ReturnType<typeof crearMockPacienteRepository>;
  let citaQuery: ReturnType<typeof crearMockCitaPacienteQueryPort>;
  let useCase: ListarCitasPacienteUseCase;

  beforeEach(() => {
    pacienteRepo = crearMockPacienteRepository();
    citaQuery = crearMockCitaPacienteQueryPort();
    useCase = new ListarCitasPacienteUseCase(pacienteRepo, citaQuery);
  });

  // ─── Casos de éxito ─────────────────────────────────────────────────────────

  describe("ejecutar (éxito)", () => {
    it("debe retornar las citas del paciente sin filtros", async () => {
      // Arrange
      const citas = [
        crearDetalleCitaPaciente({ idCita: 1 }),
        crearDetalleCitaPaciente({ idCita: 2, codigoTicket: "TK-20261020-002" }),
      ];
      pacienteRepo.findByUsuarioId.mockResolvedValue(
        crearPaciente({ idPaciente: ID_PACIENTE, Usuario_idUsuario: ID_USUARIO })
      );
      citaQuery.listarCitasPaciente.mockResolvedValue(citas);

      // Act
      const resultado = await useCase.ejecutar(ID_USUARIO);

      // Assert
      expect(resultado).toEqual(citas);
      expect(pacienteRepo.findByUsuarioId).toHaveBeenCalledWith(ID_USUARIO);
      expect(citaQuery.listarCitasPaciente).toHaveBeenCalledWith(ID_PACIENTE, undefined);
    });

    it("debe retornar las citas filtradas por medicoId", async () => {
      // Arrange
      const citas = [crearDetalleCitaPaciente({ idCita: 10 })];
      pacienteRepo.findByUsuarioId.mockResolvedValue(
        crearPaciente({ idPaciente: ID_PACIENTE, Usuario_idUsuario: ID_USUARIO })
      );
      citaQuery.listarCitasPaciente.mockResolvedValue(citas);

      // Act
      const resultado = await useCase.ejecutar(ID_USUARIO, { medicoId: MEDICO_ID });

      // Assert
      expect(resultado).toEqual(citas);
      expect(citaQuery.listarCitasPaciente).toHaveBeenCalledWith(ID_PACIENTE, {
        medicoId: MEDICO_ID,
      });
    });

    it("debe retornar las citas filtradas por especialidadId", async () => {
      // Arrange
      const citas = [crearDetalleCitaPaciente({ idCita: 11 })];
      pacienteRepo.findByUsuarioId.mockResolvedValue(
        crearPaciente({ idPaciente: ID_PACIENTE, Usuario_idUsuario: ID_USUARIO })
      );
      citaQuery.listarCitasPaciente.mockResolvedValue(citas);

      // Act
      const resultado = await useCase.ejecutar(ID_USUARIO, {
        especialidadId: ESPECIALIDAD_ID,
      });

      // Assert
      expect(resultado).toEqual(citas);
      expect(citaQuery.listarCitasPaciente).toHaveBeenCalledWith(ID_PACIENTE, {
        especialidadId: ESPECIALIDAD_ID,
      });
    });

    it("debe retornar las citas filtradas por fecha", async () => {
      // Arrange
      const citas = [crearDetalleCitaPaciente({ idCita: 12 })];
      pacienteRepo.findByUsuarioId.mockResolvedValue(
        crearPaciente({ idPaciente: ID_PACIENTE, Usuario_idUsuario: ID_USUARIO })
      );
      citaQuery.listarCitasPaciente.mockResolvedValue(citas);

      // Act
      const resultado = await useCase.ejecutar(ID_USUARIO, { fecha: FECHA_FILTRO });

      // Assert
      expect(resultado).toEqual(citas);
      expect(citaQuery.listarCitasPaciente).toHaveBeenCalledWith(ID_PACIENTE, {
        fecha: FECHA_FILTRO,
      });
    });

    it("debe retornar las citas con múltiples filtros combinados", async () => {
      // Arrange
      const citas = [crearDetalleCitaPaciente({ idCita: 13 })];
      pacienteRepo.findByUsuarioId.mockResolvedValue(
        crearPaciente({ idPaciente: ID_PACIENTE, Usuario_idUsuario: ID_USUARIO })
      );
      citaQuery.listarCitasPaciente.mockResolvedValue(citas);

      // Act
      const resultado = await useCase.ejecutar(ID_USUARIO, {
        medicoId: MEDICO_ID,
        fecha: FECHA_FILTRO,
      });

      // Assert
      expect(resultado).toEqual(citas);
      expect(citaQuery.listarCitasPaciente).toHaveBeenCalledWith(ID_PACIENTE, {
        medicoId: MEDICO_ID,
        fecha: FECHA_FILTRO,
      });
    });

    it("debe retornar un array vacío si el paciente no tiene citas", async () => {
      // Arrange
      pacienteRepo.findByUsuarioId.mockResolvedValue(
        crearPaciente({ idPaciente: ID_PACIENTE, Usuario_idUsuario: ID_USUARIO })
      );
      citaQuery.listarCitasPaciente.mockResolvedValue([]);

      // Act
      const resultado = await useCase.ejecutar(ID_USUARIO);

      // Assert
      expect(resultado).toEqual([]);
      expect(citaQuery.listarCitasPaciente).toHaveBeenCalledWith(ID_PACIENTE, undefined);
    });
  });

  // ─── Casos de excepción ─────────────────────────────────────────────────────

  describe("ejecutar (excepciones)", () => {
    it("debe lanzar PacienteNoEncontradoException si el usuario no tiene perfil de paciente", async () => {
      // Arrange
      pacienteRepo.findByUsuarioId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(ID_USUARIO)).rejects.toThrow(
        PacienteNoEncontradoException
      );
      expect(citaQuery.listarCitasPaciente).not.toHaveBeenCalled();
    });
  });
});
