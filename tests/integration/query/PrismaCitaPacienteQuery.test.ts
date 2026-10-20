import { PrismaCitaPacienteQuery } from '../../../src/infrastructure/query/PrismaCitaPacienteQuery';
import { prisma } from '../../../src/infrastructure/database/prisma';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { EstadoTicket } from '../../../src/domain/enum/EstadoTicket';

describe('PrismaCitaPacienteQuery Integration Tests', () => {
  const query = new PrismaCitaPacienteQuery();

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  // ─── Helpers de seed ────────────────────────────────────────────────────────

  const seedUsuario = async (suffix: string, rol: Rol) =>
    prisma.usuario.create({
      data: {
        contrasena: '$2a$10$dummyhashedpasswordfortesting',
        nombres: `Nombre${suffix}`,
        apellidos: `Apellido${suffix}`,
        correo: `${suffix}@example.com`,
        telefono: '999888777',
        documento_identidad: `DOC${suffix}`,
        fecha_nacimiento: new Date('1990-01-01T00:00:00.000Z'),
        genero: Genero.MASCULINO,
        rol,
        verificado: true,
      },
    });

  const seedEspecialidad = async (nombre: string) =>
    prisma.especialidad.create({ data: { nombreEspecialidad: nombre } });

  const seedMedico = async (suffix: string, especialidadId: number) => {
    const usuario = await seedUsuario(`medico${suffix}`, Rol.MEDICO);
    return prisma.medico.create({
      data: {
        Usuario_idUsuario: usuario.idUsuario,
        Especialidad_idEspecialidad: especialidadId,
      },
    });
  };

  const seedPaciente = async (suffix: string) => {
    const usuario = await seedUsuario(`paciente${suffix}`, Rol.PACIENTE);
    return prisma.paciente.create({ data: { Usuario_idUsuario: usuario.idUsuario } });
  };

  const seedCita = async (
    pacienteId: number,
    medicoId: number,
    fecha: Date,
    hora: Date
  ) => {
    const cita = await prisma.cita.create({
      data: {
        Paciente_idPaciente: pacienteId,
        Medico_idMedico: medicoId,
        Fecha: fecha,
        Hora: hora,
        motivo: 'Consulta general',
      },
    });

    await prisma.ticketCita.create({
      data: {
        codigoTicket: `TK-${cita.idCita}`,
        Cita_idCita: cita.idCita,
        codigoPago: null,
        estado: EstadoTicket.PENDIENTE,
      },
    });

    return cita;
  };

  const HORA_1430 = new Date(Date.UTC(1970, 0, 1, 14, 30, 0));
  const HORA_0900 = new Date(Date.UTC(1970, 0, 1, 9, 0, 0));

  // ─── Casos de prueba ────────────────────────────────────────────────────────

  it('debe ejecutar la query y retornar los resultados con el formato correcto', async () => {
    const especialidad = await seedEspecialidad('Cardiología');
    const medico = await seedMedico('uno', especialidad.idEspecialidad);
    const paciente = await seedPaciente('uno');
    const cita = await seedCita(
      paciente.idPaciente,
      medico.idMedico,
      new Date('2026-10-20T00:00:00.000Z'),
      HORA_1430
    );

    const resultados = await query.listarCitasPaciente(paciente.idPaciente);

    expect(resultados).toHaveLength(1);
    expect(resultados[0].idCita).toBe(cita.idCita);
    expect(resultados[0].codigoTicket).toBe(`TK-${cita.idCita}`);
    expect(resultados[0].nombreMedico).toBe('Nombremedicouno Apellidomedicouno');
    expect(resultados[0].especialidad).toBe('Cardiología');
    expect(resultados[0].fecha).toBeInstanceOf(Date);
    expect(resultados[0].hora).toBeInstanceOf(Date);
  });

  it('debe filtrar por medicoId', async () => {
    const especialidad = await seedEspecialidad('Cardiología');
    const medicoA = await seedMedico('a', especialidad.idEspecialidad);
    const medicoB = await seedMedico('b', especialidad.idEspecialidad);
    const paciente = await seedPaciente('filtroMedico');

    const citaA = await seedCita(
      paciente.idPaciente,
      medicoA.idMedico,
      new Date('2026-10-20T00:00:00.000Z'),
      HORA_1430
    );
    await seedCita(
      paciente.idPaciente,
      medicoB.idMedico,
      new Date('2026-10-21T00:00:00.000Z'),
      HORA_0900
    );

    const resultados = await query.listarCitasPaciente(paciente.idPaciente, {
      medicoId: medicoA.idMedico,
    });

    expect(resultados).toHaveLength(1);
    expect(resultados[0].idCita).toBe(citaA.idCita);
  });

  it('debe filtrar por especialidadId', async () => {
    const cardiologistia = await seedEspecialidad('Cardiología');
    const dermatologia = await seedEspecialidad('Dermatología');
    const medicoCardio = await seedMedico('cardio', cardiologistia.idEspecialidad);
    const medicoDerma = await seedMedico('derma', dermatologia.idEspecialidad);
    const paciente = await seedPaciente('filtroEspecialidad');

    const citaCardio = await seedCita(
      paciente.idPaciente,
      medicoCardio.idMedico,
      new Date('2026-10-20T00:00:00.000Z'),
      HORA_1430
    );
    await seedCita(
      paciente.idPaciente,
      medicoDerma.idMedico,
      new Date('2026-10-21T00:00:00.000Z'),
      HORA_0900
    );

    const resultados = await query.listarCitasPaciente(paciente.idPaciente, {
      especialidadId: dermatologia.idEspecialidad,
    });

    expect(resultados).toHaveLength(1);
    expect(resultados[0].idCita).not.toBe(citaCardio.idCita);
    expect(resultados[0].especialidad).toBe('Dermatología');
  });

  it('debe filtrar por fecha', async () => {
    const especialidad = await seedEspecialidad('Cardiología');
    const medico = await seedMedico('fecha', especialidad.idEspecialidad);
    const paciente = await seedPaciente('filtroFecha');

    const citaObjetivo = await seedCita(
      paciente.idPaciente,
      medico.idMedico,
      new Date('2026-10-20T00:00:00.000Z'),
      HORA_1430
    );
    await seedCita(
      paciente.idPaciente,
      medico.idMedico,
      new Date('2026-10-21T00:00:00.000Z'),
      HORA_0900
    );

    const resultados = await query.listarCitasPaciente(paciente.idPaciente, {
      fecha: new Date('2026-10-20T00:00:00.000Z'),
    });

    expect(resultados).toHaveLength(1);
    expect(resultados[0].idCita).toBe(citaObjetivo.idCita);
  });

  it('debe retornar las citas ordenadas por fecha y hora descendentes', async () => {
    const especialidad = await seedEspecialidad('Cardiología');
    const medico = await seedMedico('orden', especialidad.idEspecialidad);
    const paciente = await seedPaciente('orden');

    await seedCita(
      paciente.idPaciente,
      medico.idMedico,
      new Date('2026-10-20T00:00:00.000Z'),
      HORA_1430
    );
    const citaMasReciente = await seedCita(
      paciente.idPaciente,
      medico.idMedico,
      new Date('2026-10-21T00:00:00.000Z'),
      HORA_0900
    );

    const resultados = await query.listarCitasPaciente(paciente.idPaciente);

    expect(resultados).toHaveLength(2);
    expect(resultados[0].idCita).toBe(citaMasReciente.idCita);
  });

  it('debe retornar un array vacío si el paciente no tiene citas', async () => {
    const paciente = await seedPaciente('sinCitas');

    const resultados = await query.listarCitasPaciente(paciente.idPaciente);

    expect(resultados).toEqual([]);
  });
});
