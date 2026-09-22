-- Revertir migración de VerificacionCorreo
DROP TABLE IF EXISTS `VerificacionCorreo`;

-- Eliminar índice
DROP INDEX `idx_usuario_correo_verificado` ON `Usuario`;

-- Eliminar columnas añadidas a Usuario
ALTER TABLE `Usuario`
DROP COLUMN `fecha_verificacion_correo`,
DROP COLUMN `correo_verificado`;

