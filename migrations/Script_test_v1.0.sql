USE CitasMedicasJYP;

-- 1. Tabla Usuario (5 Pacientes + 5 Médicos = 10 Usuarios en total)
-- Pacientes (idUsuario 1 al 5)
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Carlos', 'Gomez', 'carlos.gomez@mail.com', '987654321', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Ana', 'Torres', 'ana.torres@mail.com', '987654322', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Luis', 'Ramirez', 'luis.ramirez@mail.com', '987654323', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Maria', 'Lopez', 'maria.lopez@mail.com', '987654324', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Jorge', 'Castro', 'jorge.castro@mail.com', '987654325', 'Paciente');

-- Médicos (idUsuario 6 al 10)
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Laura', 'Diaz', 'laura.diaz@mail.com', '987654326', 'Medico');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Pedro', 'Ruiz', 'pedro.ruiz@mail.com', '987654327', 'Medico');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Sofia', 'Vargas', 'sofia.vargas@mail.com', '987654328', 'Medico');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Diego', 'Rios', 'diego.rios@mail.com', '987654329', 'Medico');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Elena', 'Mendoza', 'elena.mendoza@mail.com', '987654330', 'Medico');

-- 2. Tabla ContactoEmergencia (5 registros para los 5 pacientes)
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222331', 'emerg1@mail.com', 'Jose', 'Gomez', 'Padre');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222332', 'emerg2@mail.com', 'Rosa', 'Torres', 'Madre');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222333', 'emerg3@mail.com', 'Miguel', 'Ramirez', 'Hermano');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222334', 'emerg4@mail.com', 'Lucia', 'Lopez', 'Hermana');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222335', 'emerg5@mail.com', 'Raul', 'Castro', 'Tio');

-- 3. Tabla Paciente (Maping estricto a idUsuario 1 al 5)
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111221', '1990-05-14', 1, 1);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111222', '1985-08-20', 2, 2);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111223', '1992-11-03', 3, 3);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111224', '1978-02-15', 4, 4);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111225', '2001-09-30', 5, 5);

-- 4. Tabla Especialidad
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Cardiología');      -- idEspecialidad 1
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Dermatología');     -- idEspecialidad 2
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Pediatría');        -- idEspecialidad 3
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Neurología');       -- idEspecialidad 4
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Medicina General'); -- idEspecialidad 5

-- 5. Tabla Medico (Maping estricto a idUsuario 6 al 10)
-- idMedico 1: Laura (idUsuario 6) -> Cardiología (1)
-- idMedico 2: Pedro (idUsuario 7) -> Dermatología (2)
-- idMedico 3: Sofia (idUsuario 8) -> Pediatría (3)
-- idMedico 4: Diego (idUsuario 9) -> Neurología (4)
-- idMedico 5: Elena (idUsuario 10) -> Medicina General (5)
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (6, 1);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (7, 2);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (8, 3);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (9, 4);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (10, 5);

-- 6. Tabla Cita (Relaciona Pacientes 1-5 con Médicos 1-5)
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (1, 5, '2026-09-10', '09:00:00', 'Chequeo general rutinario');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (2, 4, '2026-09-11', '10:30:00', 'Consulta por dolor de cabeza intenso');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (3, 1, '2026-09-12', '11:00:00', 'Evaluación de presión arterial y dolor en el pecho');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (4, 2, '2026-09-13', '14:00:00', 'Alergia y sarpullido en la piel');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (5, 3, '2026-09-14', '15:30:00', 'Control de crecimiento pediátrico');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (1, 1, '2026-09-15', '09:15:00', 'Seguimiento cardiológico');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (2, 5, '2026-09-16', '16:00:00', 'Emisión de certificado médico');

-- 7. Tabla TicketCita (IDs de Cita válidos: 1 al 7)
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0001', 1, 'PAG-0001', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0002', 2, 'PAG-0002', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0003', 3, 'PAG-0003', 'Pendiente');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0004', 4, 'PAG-0004', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0005', 5, 'PAG-0005', 'Cancelado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0006', 6, 'PAG-0006', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0007', 7, 'PAG-0007', 'Confirmado');

-- 8. Tabla Horario (Asignados a idMedico 1 al 5)
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Lunes', 'Mañana', '08:00:00', '12:00:00', 1);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Martes', 'Tarde', '14:00:00', '18:00:00', 2);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Miércoles', 'Mañana', '09:00:00', '13:00:00', 3);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Jueves', 'Tarde', '15:00:00', '19:00:00', 4);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Viernes', 'Mañana', '08:00:00', '12:00:00', 5);

-- 9. Tabla Pago (Asignados a TicketCita 1 al 7)
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Tarjeta Crédito', 150.00, '2026-09-01', '08:15:00', 'Completado', 'BCP', 1);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Efectivo', 100.00, '2026-09-02', '09:30:00', 'Completado', NULL, 2);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Transferencia', 200.00, '2026-09-03', '10:45:00', 'Pendiente', 'BBVA', 3);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Tarjeta Débito', 120.00, '2026-09-04', '11:00:00', 'Completado', 'Interbank', 4);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Yape/Plin', 80.00, '2026-09-05', '12:15:00', 'Reembolsado', 'BCP', 5);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Tarjeta Crédito', 180.00, '2026-09-06', '14:20:00', 'Completado', 'Scotiabank', 6);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Efectivo', 90.00, '2026-09-07', '15:10:00', 'Completado', NULL, 7);