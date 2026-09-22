-- =============================================================
-- Migración: 002b_add_notification
-- Descripción: Sistema de notificaciones in-app para eventos
--              de citas: creación y cancelación.
-- Autor: Alessandro
-- Fecha: 2026-09-22
-- Depende de: 001_init_db.sql
-- =============================================================

USE `Sistema_Medico_JYP`;

-- -------------------------------------------------------------
-- 1. CATÁLOGO DE TIPOS DE NOTIFICACIÓN
--    Solo los tipos necesarios para eventos de citas
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `TipoNotificacion` (
  `idTipoNotificacion` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(150) NOT NULL,
  `rol_destino` VARCHAR(20) NOT NULL
    COMMENT 'PACIENTE, MEDICO, ADMIN, TODOS',
  `canal_default` VARCHAR(20) NOT NULL DEFAULT 'SISTEMA'
    COMMENT 'SISTEMA, EMAIL, SMS, PUSH',
  `prioridad` VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
    COMMENT 'BAJA, NORMAL, ALTA, URGENTE',
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`idTipoNotificacion`),
  UNIQUE INDEX `codigo_UNIQUE` (`codigo`)
)
ENGINE = InnoDB;

-- -------------------------------------------------------------
-- 2. TABLA PRINCIPAL DE NOTIFICACIONES (bandeja in-app)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Notificacion` (
  `idNotificacion` INT NOT NULL AUTO_INCREMENT,
  `Usuario_idUsuario` INT NOT NULL
    COMMENT 'Destinatario (paciente, médico o admin)',
  `TipoNotificacion_idTipoNotificacion` INT NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `leido` BOOLEAN NOT NULL DEFAULT FALSE,
  `fecha_envio` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_leido` TIMESTAMP NULL DEFAULT NULL,
  `canal` VARCHAR(20) NOT NULL DEFAULT 'SISTEMA',
  `prioridad` VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
  `referencia_id` INT NULL
    COMMENT 'ID de la cita relacionada',
  `referencia_tipo` VARCHAR(30) NULL DEFAULT 'Cita',
  `url_destino` VARCHAR(255) NULL
    COMMENT 'Ruta del frontend al hacer clic, ej: /citas/historial/5',
  `metadata` JSON NULL,
  PRIMARY KEY (`idNotificacion`),
  CONSTRAINT `fk_Notificacion_Usuario1`
    FOREIGN KEY (`Usuario_idUsuario`)
    REFERENCES `Usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Notificacion_TipoNotificacion1`
    FOREIGN KEY (`TipoNotificacion_idTipoNotificacion`)
    REFERENCES `TipoNotificacion` (`idTipoNotificacion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB;

-- -------------------------------------------------------------
-- 3. ÍNDICES para consultas frecuentes del frontend
-- -------------------------------------------------------------

-- Bandeja del usuario (no leídas primero)
CREATE INDEX `idx_notificacion_usuario_leido`
  ON `Notificacion` (`Usuario_idUsuario`, `leido`, `fecha_envio` DESC);

-- Filtrar por tipo
CREATE INDEX `idx_notificacion_tipo`
  ON `Notificacion` (`TipoNotificacion_idTipoNotificacion`);

-- Buscar todas las notificaciones de una cita
CREATE INDEX `idx_notificacion_referencia`
  ON `Notificacion` (`referencia_tipo`, `referencia_id`);

-- -------------------------------------------------------------
-- 4. SEED: tipos de notificación para eventos de citas
-- -------------------------------------------------------------
INSERT INTO `TipoNotificacion`
  (`codigo`, `descripcion`, `rol_destino`, `canal_default`, `prioridad`) VALUES

  -- === CREACIÓN DE CITA ===
  ('CITA_AGENDADA',
   'Cita agendada exitosamente',
   'PACIENTE', 'SISTEMA', 'NORMAL'),

  ('NUEVA_CITA_MEDICO',
   'El médico recibió una nueva cita',
   'MEDICO', 'SISTEMA', 'NORMAL'),

  ('NUEVA_CITA_ADMIN',
   'Nueva cita registrada en el sistema',
   'ADMIN', 'SISTEMA', 'BAJA'),

  -- === CANCELACIÓN / ELIMINACIÓN DE CITA ===
  ('CITA_CANCELADA_PACIENTE',
   'Notificación al paciente de cita cancelada',
   'PACIENTE', 'SISTEMA', 'ALTA'),

  ('CITA_CANCELADA_MEDICO',
   'Notificación al médico de cita cancelada',
   'MEDICO', 'SISTEMA', 'ALTA'),

  ('CITA_CANCELADA_ADMIN',
   'Notificación al admin de cita cancelada',
   'ADMIN', 'SISTEMA', 'NORMAL')

ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`),
  `rol_destino` = VALUES(`rol_destino`),
  `prioridad`   = VALUES(`prioridad`);