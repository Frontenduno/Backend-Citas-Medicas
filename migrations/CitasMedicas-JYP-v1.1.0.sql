-- MySQL Migration v1.1.0
-- Tabla HistorialClinico para registrar historiales clínicos por cita
-- Fecha: 2026-09-08

USE CitasMedicasJYP;

-- -----------------------------------------------------
-- Table `CitasMedicasJYP`.`HistorialClinico`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CitasMedicasJYP`.`HistorialClinico` ;

CREATE TABLE IF NOT EXISTS `CitasMedicasJYP`.`HistorialClinico` (
  `idHistorial` INT NOT NULL AUTO_INCREMENT,
  `Cita_idCita` INT NOT NULL,
  `diagnostico` MEDIUMTEXT NOT NULL,
  `tratamiento` MEDIUMTEXT NULL,
  `observaciones` MEDIUMTEXT NULL,
  `fechaRegistro` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`idHistorial`),
  CONSTRAINT `fk_HistorialClinico_Cita1`
    FOREIGN KEY (`Cita_idCita`)
    REFERENCES `CitasMedicasJYP`.`Cita` (`idCita`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE UNIQUE INDEX `Cita_idCita_UNIQUE` ON `CitasMedicasJYP`.`HistorialClinico` (`Cita_idCita` ASC);

CREATE INDEX `fk_HistorialClinico_Cita1_idx` ON `CitasMedicasJYP`.`HistorialClinico` (`Cita_idCita` ASC);

