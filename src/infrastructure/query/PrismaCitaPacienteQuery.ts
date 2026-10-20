import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import { CitaPacienteQueryPort } from '../../application/port/CitaPacienteQueryPort';
import { DetalleCitaPacienteDTO, FiltrosCitaPacienteDTO } from '../../application/dto/CitaPacienteDTO';

export class PrismaCitaPacienteQuery implements CitaPacienteQueryPort {

  async listarCitasPaciente(
    pacienteId: number,
    filtros?: FiltrosCitaPacienteDTO
  ): Promise<DetalleCitaPacienteDTO[]> {

    // Construir condiciones dinámicas
    const conditions: Prisma.Sql[] = [
      Prisma.sql`c.Paciente_idPaciente = ${pacienteId}`
    ];

    if (filtros?.medicoId) {
      conditions.push(Prisma.sql`c.Medico_idMedico = ${filtros.medicoId}`);
    }
    if (filtros?.especialidadId) {
      conditions.push(Prisma.sql`m.Especialidad_idEspecialidad = ${filtros.especialidadId}`);
    }
    if (filtros?.fecha) {
      conditions.push(Prisma.sql`c.Fecha = ${filtros.fecha}`);
    }

    const whereClause = Prisma.join(conditions, ' AND ');

    const results = await prisma.$queryRaw<DetalleCitaPacienteDTO[]>(
      Prisma.sql`
        SELECT 
          c.idCita,
          tc.codigoTicket,
          CONCAT(u.nombres, ' ', u.apellidos) AS nombreMedico,
          e.nombreEspecialidad AS especialidad,
          c.Fecha AS fecha,
          c.Hora AS hora
        FROM Cita c
        INNER JOIN TicketCita tc ON c.idCita = tc.Cita_idCita
        INNER JOIN Medico m ON c.Medico_idMedico = m.idMedico
        INNER JOIN Usuario u ON m.Usuario_idUsuario = u.idUsuario
        INNER JOIN Especialidad e ON m.Especialidad_idEspecialidad = e.idEspecialidad
        WHERE ${whereClause}
        ORDER BY c.Fecha DESC, c.Hora DESC
      `
    );

    return results;
  }
}
