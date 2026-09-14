USE `Sistema_Medico_JYP`;

-- 1. Inserción de Especialidades médicas
INSERT INTO `Especialidad` (`nombreEspecialidad`) VALUES 
('Cardiología'),
('Pediatría'),
('Medicina General'),
('Dermatología');

-- 2. Inserción de Usuarios (Roles: Medico, Paciente)
INSERT INTO `Usuario` (`contrasena`, `nombres`, `apellidos`, `correo`, `telefono`, `fecha_nacimiento`, `genero`, `rol`, `updated_at`) VALUES
-- Médicos (IDs 1 y 2)
('$2y$10$e9VxK8v...hash1', 'Carlos', 'Mendoza Ruiz', 'carlos.mendoza@medico.com', '987654321', '1980-05-15', 'Masculino', 'Medico', CURRENT_TIMESTAMP),
('$2y$10$e9VxK8v...hash2', 'Ana', 'Torres Silva', 'ana.torres@medico.com', '912345678', '1985-09-20', 'Femenino', 'Medico', CURRENT_TIMESTAMP),
-- Pacientes (IDs 3 y 4)
('$2y$10$e9VxK8v...hash3', 'Juan', 'Perez Gomez', 'juan.perez@gmail.com', '955443322', '1992-03-10', 'Masculino', 'Paciente', CURRENT_TIMESTAMP),
('$2y$10$e9VxK8v...hash4', 'Maria', 'Lopez Quispe', 'maria.lopez@gmail.com', '966778899', '1998-11-25', 'Femenino', 'Paciente', CURRENT_TIMESTAMP);

-- 3. Inserción de Médicos (Vinculados a Usuario y Especialidad)
INSERT INTO `Medico` (`Usuario_idUsuario`, `Especialidad_idEspecialidad`) VALUES 
(1, 1), -- Dr. Carlos Mendoza -> Cardiología
(2, 3); -- Dra. Ana Torres -> Medicina General

-- 4. Inserción de Pacientes (Vinculados a Usuario)
INSERT INTO `Paciente` (`Usuario_idUsuario`) VALUES 
(3), -- Juan Perez
(4); -- Maria Lopez

-- 5. Inserción de Contactos de Emergencia
INSERT INTO `ContactoEmergencia` (`telefono`, `correo`, `nombres`, `apellidos`, `parentesco`, `Paciente_idPaciente`) VALUES 
('999888777', 'lucia.perez@gmail.com', 'Lucia', 'Perez Gomez', 'Hermana', 1),
('944556677', 'carlos.lopez@gmail.com', 'Jorge', 'Lopez Quispe', 'Padre', 2);

-- 6. Inserción de Horarios de Atención para los Médicos
INSERT INTO `Horario` (`Medico_idMedico`) VALUES 
(1), -- Horario para Dr. Carlos Mendoza
(2); -- Horario para Dra. Ana Torres

-- 7. Inserción de Detalles de Horario (Días y turnos)
INSERT INTO `DetallesHorario` (`diaSemana`, `turno`, `horaInicio`, `horaFin`, `Horario_idHorario`) VALUES 
('Lunes', 'Mañana', '08:00:00', '13:00:00', 1),
('Miércoles', 'Tarde', '14:00:00', '18:00:00', 1),
('Martes', 'Mañana', '08:00:00', '13:00:00', 2);

-- 8. Inserción de Citas Médicas
INSERT INTO `Cita` (`Paciente_idPaciente`, `Medico_idMedico`, `Fecha`, `Hora`, `motivo`) VALUES 
(1, 1, '2026-04-10', '09:00:00', 'Control de presión arterial y dolor en el pecho leve.'),
(2, 2, '2026-04-11', '10:30:00', 'Chequeo general y renovación de recetas.');

-- 9. Inserción de Tickets de Cita
INSERT INTO `TicketCita` (`codigoTicket`, `Cita_idCita`, `codigoPago`, `estado`) VALUES 
('TCK-2026-001', 1, 'PAG-987654', 'Confirmado'),
('TCK-2026-002', 2, 'PAG-987655', 'Pendiente');

-- 10. Inserción de Pagos
INSERT INTO `Pago` (`metodo`, `monto`, `fecha`, `hora`, `estado`, `banco`, `TicketCita_idTicketCita`) VALUES 
('Tarjeta de Crédito', 150.00, '2026-04-01', '08:30:00', 'Completado', 'BCP', 1);