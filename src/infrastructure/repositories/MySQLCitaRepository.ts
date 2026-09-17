import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getConnection } from '../database/PoolConexion';
import { Cita } from '../../domain/entities/Cita';
import { TicketCita, EstadoTicket } from '../../domain/entities/TicketCita';
import { Horario, DiaSemana } from '../../domain/entities/Horario';
import {
  ICitaRepository,
  CitaWithTicket,
  DisponibilidadResult,
} from '../../domain/repositories/ICitaRepository';

interface CitaRow extends RowDataPacket {
  idCita: number;
  Paciente_idPaciente: number;
  Medico_idMedico: number;
  Fecha: string;
  Hora: string;
  motivo: string | null;
  idTicketCita?: number | null;
  codigoTicket?: string | null;
  codigoPago?: string | null;
  estado?: EstadoTicket | null;
}

interface HorarioRow extends RowDataPacket {
  idHorario: number;
  diaSemana: DiaSemana;
  turno: string;
  horaInicio: string;
  horaFin: string;
  Medico_idMedico: number;
}

function generarCodigoTicket(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${timestamp}-${random}`;
}

function generarCodigoPago(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAG-${timestamp}-${random}`;
}

export class MySQLCitaRepository implements ICitaRepository {
  async createCita(
    pacienteId: number,
    medicoId: number,
    fecha: string,
    hora: string,
    motivo: string | null,
  ): Promise<{ cita: Cita; ticket: TicketCita }> {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      const [citaResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (?, ?, ?, ?, ?)',
        [pacienteId, medicoId, fecha, hora, motivo],
      );

      const idCita = citaResult.insertId;
      const codigoTicket = generarCodigoTicket();
      const codigoPago = generarCodigoPago();

      const [ticketResult] = await connection.execute<ResultSetHeader>(
        "INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES (?, ?, ?, 'Pendiente')",
        [codigoTicket, idCita, codigoPago],
      );

      await connection.commit();

      const cita = new Cita(idCita, pacienteId, medicoId, fecha, hora, motivo);
      const ticket = new TicketCita(
        ticketResult.insertId,
        codigoTicket,
        idCita,
        codigoPago,
        'Pendiente',
      );

      return { cita, ticket };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findCitaById(idCita: number): Promise<CitaWithTicket | null> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute<CitaRow[]>(
        `SELECT c.*, tc.idTicketCita, tc.codigoTicket, tc.codigoPago, tc.estado
         FROM Cita c
         LEFT JOIN TicketCita tc ON tc.Cita_idCita = c.idCita
         WHERE c.idCita = ?`,
        [idCita],
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        cita: new Cita(
          row.idCita,
          row.Paciente_idPaciente,
          row.Medico_idMedico,
          row.Fecha,
          row.Hora,
          row.motivo,
        ),
        ticket: row.idTicketCita
          ? new TicketCita(
              row.idTicketCita,
              row.codigoTicket!,
              row.idCita,
              row.codigoPago ?? null,
              row.estado as EstadoTicket,
            )
          : null,
      };
    } finally {
      connection.release();
    }
  }

  async findCitasByPaciente(pacienteId: number): Promise<CitaWithTicket[]> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute<CitaRow[]>(
        `SELECT c.*, tc.idTicketCita, tc.codigoTicket, tc.codigoPago, tc.estado
         FROM Cita c
         LEFT JOIN TicketCita tc ON tc.Cita_idCita = c.idCita
         WHERE c.Paciente_idPaciente = ?
         ORDER BY c.Fecha DESC, c.Hora DESC`,
        [pacienteId],
      );

      return rows.map((row) => ({
        cita: new Cita(
          row.idCita,
          row.Paciente_idPaciente,
          row.Medico_idMedico,
          row.Fecha,
          row.Hora,
          row.motivo,
        ),
        ticket: row.idTicketCita
          ? new TicketCita(
              row.idTicketCita,
              row.codigoTicket!,
              row.idCita,
              row.codigoPago ?? null,
              row.estado as EstadoTicket,
            )
          : null,
      }));
    } finally {
      connection.release();
    }
  }

  async findCitasByMedico(medicoId: number): Promise<CitaWithTicket[]> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute<CitaRow[]>(
        `SELECT c.*, tc.idTicketCita, tc.codigoTicket, tc.codigoPago, tc.estado
         FROM Cita c
         LEFT JOIN TicketCita tc ON tc.Cita_idCita = c.idCita
         WHERE c.Medico_idMedico = ?
         ORDER BY c.Fecha DESC, c.Hora DESC`,
        [medicoId],
      );

      return rows.map((row) => ({
        cita: new Cita(
          row.idCita,
          row.Paciente_idPaciente,
          row.Medico_idMedico,
          row.Fecha,
          row.Hora,
          row.motivo,
        ),
        ticket: row.idTicketCita
          ? new TicketCita(
              row.idTicketCita,
              row.codigoTicket!,
              row.idCita,
              row.codigoPago ?? null,
              row.estado as EstadoTicket,
            )
          : null,
      }));
    } finally {
      connection.release();
    }
  }

  async findCitasByFecha(fecha: string): Promise<CitaWithTicket[]> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute<CitaRow[]>(
        `SELECT c.*, tc.idTicketCita, tc.codigoTicket, tc.codigoPago, tc.estado
         FROM Cita c
         LEFT JOIN TicketCita tc ON tc.Cita_idCita = c.idCita
         WHERE c.Fecha = ?
         ORDER BY c.Hora ASC`,
        [fecha],
      );

      return rows.map((row) => ({
        cita: new Cita(
          row.idCita,
          row.Paciente_idPaciente,
          row.Medico_idMedico,
          row.Fecha,
          row.Hora,
          row.motivo,
        ),
        ticket: row.idTicketCita
          ? new TicketCita(
              row.idTicketCita,
              row.codigoTicket!,
              row.idCita,
              row.codigoPago ?? null,
              row.estado as EstadoTicket,
            )
          : null,
      }));
    } finally {
      connection.release();
    }
  }

  async updateEstadoCita(idTicketCita: number, estado: EstadoTicket): Promise<boolean> {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE TicketCita SET estado = ? WHERE idTicketCita = ?',
        [estado, idTicketCita],
      );

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async deleteCita(idCita: number): Promise<boolean> {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // Eliminar pagos asociados al ticket de la cita
      await connection.execute(
        `DELETE p FROM Pago p
         INNER JOIN TicketCita tc ON tc.idTicketCita = p.TicketCita_idTicketCita
         WHERE tc.Cita_idCita = ?`,
        [idCita],
      );

      // Eliminar ticket de cita
      await connection.execute('DELETE FROM TicketCita WHERE Cita_idCita = ?', [idCita]);

      // Eliminar la cita
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM Cita WHERE idCita = ?',
        [idCita],
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async verificarDisponibilidad(
    medicoId: number,
    fecha: string,
    hora: string,
  ): Promise<DisponibilidadResult> {
    const connection = await getConnection();
    try {
      // Verificar si ya existe una cita para ese médico en esa fecha y hora
      const [citas] = await connection.execute<RowDataPacket[]>(
        'SELECT idCita FROM Cita WHERE Medico_idMedico = ? AND Fecha = ? AND Hora = ?',
        [medicoId, fecha, hora],
      );

      if (citas.length > 0) {
        return {
          disponible: false,
          motivo: 'El médico ya tiene una cita agendada en esa fecha y hora',
        };
      }

      // Verificar que el médico tenga horario asignado para ese día
      const diasSemana: DiaSemana[] = [
        'Domingo',
        'Lunes',
        'Martes',
        'Miercoles',
        'Jueves',
        'Viernes',
        'Sabado',
      ];
      const diasConTilde: DiaSemana[] = [
        'Domingo',
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
      ];

      const [year, month, day] = fecha.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const diaIndex = dateObj.getDay();
      const diaSinTilde = diasSemana[diaIndex];
      const diaConTilde = diasConTilde[diaIndex];

      const [horarios] = await connection.execute<HorarioRow[]>(
        'SELECT * FROM Horario WHERE Medico_idMedico = ? AND (diaSemana = ? OR diaSemana = ?)',
        [medicoId, diaSinTilde, diaConTilde],
      );

      if (horarios.length === 0) {
        return {
          disponible: false,
          motivo: `El médico no tiene horario asignado para el día ${diaConTilde}`,
        };
      }

      const horario = horarios[0];
      if (hora < horario.horaInicio || hora >= horario.horaFin) {
        return {
          disponible: false,
          motivo: `La hora está fuera del horario del médico (${horario.horaInicio} - ${horario.horaFin})`,
        };
      }

      return {
        disponible: true,
        horario: new Horario(
          horario.idHorario,
          horario.diaSemana,
          horario.turno,
          horario.horaInicio,
          horario.horaFin,
          horario.Medico_idMedico,
        ),
      };
    } finally {
      connection.release();
    }
  }
}

