USE CitasMedicasJYP;
-- 1. Tabla Usuario
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Carlos', 'Gomez', 'carlos.gomez@mail.com', '987654321', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Ana', 'Torres', 'ana.torres@mail.com', '987654322', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Luis', 'Ramirez', 'luis.ramirez@mail.com', '987654323', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Maria', 'Lopez', 'maria.lopez@mail.com', '987654324', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Jorge', 'Castro', 'jorge.castro@mail.com', '987654325', 'Paciente');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Laura', 'Diaz', 'laura.diaz@mail.com', '987654326', 'Medico');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Pedro', 'Ruiz', 'pedro.ruiz@mail.com', '987654327', 'Medico');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Sofia', 'Vargas', 'sofia.vargas@mail.com', '987654328', 'Medico');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Diego', 'Rios', 'diego.rios@mail.com', '987654329', 'Medico');
INSERT INTO Usuario (contrasena, nombres, apellidos, correo, telefono, rol) VALUES ('pass123', 'Elena', 'Mendoza', 'elena.mendoza@mail.com', '987654330', 'Medico');

-- 2. Tabla ContactoEmergencia
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222331', 'emerg1@mail.com', 'Jose', 'Gomez', 'Padre');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222332', 'emerg2@mail.com', 'Rosa', 'Torres', 'Madre');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222333', 'emerg3@mail.com', 'Miguel', 'Ramirez', 'Hermano');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222334', 'emerg4@mail.com', 'Lucia', 'Lopez', 'Hermana');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222335', 'emerg5@mail.com', 'Raul', 'Castro', 'Tio');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222336', 'emerg6@mail.com', 'Carmen', 'Diaz', 'Esposa');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222337', 'emerg7@mail.com', 'Hugo', 'Ruiz', 'Hijo');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222338', 'emerg8@mail.com', 'Marta', 'Vargas', 'Hija');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222339', 'emerg9@mail.com', 'Andres', 'Rios', 'Primo');
INSERT INTO ContactoEmergencia (telefono, correo, nombres, apellidos, parentesco) VALUES ('911222340', 'emerg10@mail.com', 'Julia', 'Mendoza', 'Abuela');

-- 3. Tabla Paciente
-- Nota: Utilizando los idUsuario (1 al 10) y idContactoEmergencia (1 al 10)
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111221', '1990-05-14', 1, 1);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111222', '1985-08-20', 2, 2);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111223', '1992-11-03', 3, 3);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111224', '1978-02-15', 4, 4);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111225', '2001-09-30', 5, 5);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111226', '1988-12-12', 6, 6);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111227', '1995-04-25', 7, 7);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111228', '1980-07-08', 8, 8);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111229', '1999-01-19', 9, 9);
INSERT INTO Paciente (DNI, fecha_nacimiento, Usuario_idUsuario, ContactoEmergencia_idContactoEmergencia) VALUES ('70111230', '1975-06-05', 10, 10);

-- 4. Tabla Especialidad
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Cardiología');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Dermatología');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Pediatría');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Neurología');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Ginecología');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Oftalmología');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Traumatología');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Urología');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Psiquiatría');
INSERT INTO Especialidad (nombreEspecialidad) VALUES ('Medicina General');

-- 5. Tabla Medico
-- Nota: Se asignan los usuarios (1 al 10) a las especialidades (1 al 10)
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (1, 1);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (2, 2);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (3, 3);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (4, 4);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (5, 5);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (6, 6);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (7, 7);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (8, 8);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (9, 9);
INSERT INTO Medico (Usuario_idUsuario, Especialidad_idEspecialidad) VALUES (10, 10);

-- 6. Tabla Cita
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (1, 10, '2026-09-10', '09:00:00', 'Chequeo general rutinario');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (2, 9, '2026-09-11', '10:30:00', 'Consulta por dolor de cabeza');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (3, 8, '2026-09-12', '11:00:00', 'Revisión de resultados');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (4, 7, '2026-09-13', '14:00:00', 'Dolor en la rodilla');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (5, 6, '2026-09-14', '15:30:00', 'Control visual anual');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (6, 5, '2026-09-15', '09:15:00', 'Consulta ginecológica');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (7, 4, '2026-09-16', '16:00:00', 'Problemas de sueño');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (8, 3, '2026-09-17', '10:00:00', 'Control pediátrico');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (9, 2, '2026-09-18', '11:45:00', 'Alergia en la piel');
INSERT INTO Cita (Paciente_idPaciente, Medico_idMedico, Fecha, Hora, motivo) VALUES (10, 1, '2026-09-19', '08:30:00', 'Dolor en el pecho');

-- 7. Tabla TicketCita
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0001', 1, 'PAG-0001', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0002', 2, 'PAG-0002', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0003', 3, 'PAG-0003', 'Pendiente');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0004', 4, 'PAG-0004', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0005', 5, 'PAG-0005', 'Cancelado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0006', 6, 'PAG-0006', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0007', 7, 'PAG-0007', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0008', 8, 'PAG-0008', 'Pendiente');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0009', 9, 'PAG-0009', 'Confirmado');
INSERT INTO TicketCita (codigoTicket, Cita_idCita, codigoPago, estado) VALUES ('TK-0010', 10, 'PAG-0010', 'Confirmado');

-- 8. Tabla Horario
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Lunes', 'Mañana', '08:00:00', '12:00:00', 1);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Martes', 'Tarde', '14:00:00', '18:00:00', 2);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Miércoles', 'Mañana', '09:00:00', '13:00:00', 3);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Jueves', 'Tarde', '15:00:00', '19:00:00', 4);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Viernes', 'Mañana', '08:00:00', '12:00:00', 5);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Lunes', 'Tarde', '13:00:00', '17:00:00', 6);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Martes', 'Mañana', '07:00:00', '11:00:00', 7);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Miércoles', 'Tarde', '14:00:00', '18:00:00', 8);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Jueves', 'Mañana', '08:00:00', '12:00:00', 9);
INSERT INTO Horario (diaSemana, turno, horaInicio, horaFin, Medico_idMedico) VALUES ('Viernes', 'Tarde', '15:00:00', '19:00:00', 10);

-- 9. Tabla Pago
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Tarjeta Crédito', 150.00, '2026-09-01', '08:15:00', 'Completado', 'BCP', 1);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Efectivo', 100.00, '2026-09-02', '09:30:00', 'Completado', NULL, 2);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Transferencia', 200.00, '2026-09-03', '10:45:00', 'Pendiente', 'BBVA', 3);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Tarjeta Débito', 120.00, '2026-09-04', '11:00:00', 'Completado', 'Interbank', 4);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Yape/Plin', 80.00, '2026-09-05', '12:15:00', 'Reembolsado', 'BCP', 5);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Tarjeta Crédito', 180.00, '2026-09-06', '14:20:00', 'Completado', 'Scotiabank', 6);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Efectivo', 90.00, '2026-09-07', '15:10:00', 'Completado', NULL, 7);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Transferencia', 250.00, '2026-09-08', '16:05:00', 'Pendiente', 'BanBif', 8);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Tarjeta Débito', 130.00, '2026-09-09', '17:30:00', 'Completado', 'BCP', 9);
INSERT INTO Pago (metodo, monto, fecha, hora, estado, banco, TicketCita_idTicketCita) VALUES ('Yape/Plin', 110.00, '2026-09-10', '08:45:00', 'Completado', 'Interbank', 10);