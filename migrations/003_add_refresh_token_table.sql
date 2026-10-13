-- Migration: Crear tabla RefreshToken para persistencia de sesiones
-- Date: 2026-10-13
-- Description:
--   Crea la tabla 'RefreshToken' vinculada a 'Usuario' con borrado en cascada

USE `Sistema_Medico_JYP`;

-- -----------------------------------------------------
-- Tabla `RefreshToken`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Sistema_Medico_JYP`.`RefreshToken` (
  `idRefreshToken` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(500) NOT NULL,
  `idUsuario` INT NOT NULL,
  `fecha_expiracion` TIMESTAMP NOT NULL,
  `revocado` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idRefreshToken`),
  UNIQUE INDEX `token_UNIQUE` (`token` ASC),
  INDEX `fk_RefreshToken_Usuario_idx` (`idUsuario` ASC),
  CONSTRAINT `fk_RefreshToken_Usuario`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `Sistema_Medico_JYP`.`Usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB;
