import { prisma } from '../../../src/infrastructure/database/prisma';

export async function cleanDatabase(): Promise<void> {
  // Respect foreign key order when deleting records
  await prisma.codigoVerificacion.deleteMany({});
  await prisma.pago.deleteMany({});
  await prisma.ticketCita.deleteMany({});
  await prisma.cita.deleteMany({});
  await prisma.detallesHorario.deleteMany({});
  await prisma.horario.deleteMany({});
  await prisma.contactoEmergencia.deleteMany({});
  await prisma.medico.deleteMany({});
  await prisma.paciente.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.usuario.deleteMany({});
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
