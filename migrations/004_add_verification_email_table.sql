-- 1. Modificar tabla Usuario
ALTER TABLE `Usuario`
ADD COLUMN `correo_verificado` BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN `fecha_verificacion_correo` TIMESTAMP NULL DEFAULT NULL;

CREATE INDEX `idx_usuario_correo_verificado` ON `Usuario` (`correo_verificado`);

-- Opcional: Marcar usuarios existentes como verificados si es necesario
-- UPDATE `Usuario` SET `correo_verificado` = TRUE, `fecha_verificacion_correo` = CURRENT_TIMESTAMP;

-- 2. Crear tabla VerificacionCorreo
CREATE TABLE IF NOT EXISTS `VerificacionCorreo` (
  `idVerificacion` INT NOT NULL AUTO_INCREMENT,
  `Usuario_idUsuario` INT NOT NULL,
  `tipo` VARCHAR(30) NOT NULL DEFAULT 'REGISTRO',
  `codigo_hash` VARCHAR(255) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  `intentos` INT NOT NULL DEFAULT 0,
  `max_intentos` INT NOT NULL DEFAULT 5,
  `expira_en` TIMESTAMP NOT NULL,
  `ip_solicitud` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_uso` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`idVerificacion`),
  CONSTRAINT `fk_VerificacionCorreo_Usuario`
    FOREIGN KEY (`Usuario_idUsuario`)
    REFERENCES `Usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- Índices
CREATE INDEX `idx_verificacion_usuario_estado` ON `VerificacionCorreo` (`Usuario_idUsuario`, `estado`, `expira_en`);
CREATE INDEX `idx_verificacion_tipo_estado` ON `VerificacionCorreo` (`tipo`, `estado`);
CREATE INDEX `idx_verificacion_codigo` ON `VerificacionCorreo` (`codigo_hash`);