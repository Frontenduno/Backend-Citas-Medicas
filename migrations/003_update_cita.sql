-- =============================================================
-- Migración: 002a_add_estado_to_cita
-- Descripción: Agrega campo `estado` y campos de auditoría
--              a la tabla Cita para soportar cancelaciones,
--              reprogramaciones y seguimiento del ciclo de vida.
-- Autor: Alessandro
-- Fecha: 2026-09-22
-- Depende de: 001_initial_schema.sql
-- =============================================================

USE `Sistema_Medico_JYP`;

-- -------------------------------------------------------------
-- 1. Agregar columnas de estado y auditoría a Cita
-- -------------------------------------------------------------
ALTER TABLE `Cita`
  ADD COLUMN `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
    COMMENT 'PENDIENTE, CONFIRMADA, REPROGRAMADA, CANCELADA, ATENDIDA, NO_ASISTIO'
    AFTER `motivo`,

  ADD COLUMN `motivo_cancelacion` VARCHAR(255) NULL
    COMMENT 'Razón por la que se canceló la cita'
    AFTER `estado`,

  ADD COLUMN `cancelada_por` VARCHAR(20) NULL
    COMMENT 'Rol que canceló: PACIENTE, MEDICO, ADMIN, SISTEMA'
    AFTER `motivo_cancelacion`,

  ADD COLUMN `fecha_cancelacion` TIMESTAMP NULL DEFAULT NULL
    COMMENT 'Momento exacto en que se canceló la cita'
    AFTER `cancelada_por`,

  ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    COMMENT 'Fecha de creación del registro'
    AFTER `fecha_cancelacion`,

  ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    COMMENT 'Última modificación del registro'
    AFTER `created_at`;

-- -------------------------------------------------------------
-- 2. Índices para consultas frecuentes
-- -------------------------------------------------------------
CREATE INDEX `idx_cita_estado`
  ON `Cita` (`estado`);

CREATE INDEX `idx_cita_fecha_estado`
  ON `Cita` (`Fecha`, `estado`);

CREATE INDEX `idx_cita_medico_estado`
  ON `Cita` (`Medico_idMedico`, `estado`);

CREATE INDEX `idx_cita_paciente_estado`
  ON `Cita` (`Paciente_idPaciente`, `estado`);

-- -------------------------------------------------------------
-- 3. Actualizar citas existentes con un estado coherente
--    (por si ya hay datos previos en la tabla)
-- -------------------------------------------------------------
-- Las citas pasadas se marcan como ATENDIDAS
UPDATE `Cita`
SET `estado` = 'ATENDIDA'
WHERE `Fecha` < CURDATE()
  AND `estado` = 'PENDIENTE';

-- Las citas de hoy o futuras se quedan como PENDIENTE
-- (no se toca nada, ya tienen el DEFAULT)

-- -------------------------------------------------------------
-- 4. Verificación (opcional, solo para debug)
-- -------------------------------------------------------------
-- SELECT idCita, Fecha, Hora, estado, created_at, updated_at FROM Cita LIMIT 10;