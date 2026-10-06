-- Migration: Verificación de correo y documento de identidad
-- Date: 2026-09-29
-- Description:
--   1. Agrega campo 'verificado' (BOOLEAN) a la tabla Usuario
--   2. Agrega campo 'documento_identidad' (VARCHAR) a la tabla Usuario
--   3. Crea tabla 'CodigoVerificacion' para almacenar códigos temporales

USE `Sistema_Medico_JYP`;

-- -----------------------------------------------------
-- Modificar tabla Usuario: agregar campos verificado y documento_identidad
-- -----------------------------------------------------
ALTER TABLE `Usuario`
  ADD COLUMN `documento_identidad` VARCHAR(20) NULL AFTER `telefono`,
  ADD COLUMN `verificado` BOOLEAN NOT NULL DEFAULT FALSE AFTER `rol`;

CREATE UNIQUE INDEX `documento_identidad_UNIQUE` ON `Usuario` (`documento_identidad`);

-- -----------------------------------------------------
-- Tabla `CodigoVerificacion`
-- Almacena códigos de verificación temporales para el registro
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Sistema_Medico_JYP`.`CodigoVerificacion` (
  `idCodigoVerificacion` INT NOT NULL AUTO_INCREMENT,
  `correo` VARCHAR(100) NOT NULL,
  `codigo` VARCHAR(6) NOT NULL,
  `fecha_expiracion` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCodigoVerificacion`)
) ENGINE = InnoDB;

CREATE INDEX `idx_codigo_verificacion_correo` ON `CodigoVerificacion` (`correo`);
