"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    constructor(idUsuario, contrasena, nombres, apellidos, correo, telefono, fecha_nacimiento, genero, rol, correoVerificado = false, fechaVerificacionCorreo = null) {
        this.idUsuario = idUsuario ?? undefined;
        this.contrasena = contrasena;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.correo = correo;
        this.telefono = telefono;
        this.fecha_nacimiento = fecha_nacimiento;
        this.genero = genero;
        this.rol = rol;
        this.correoVerificado = correoVerificado;
        this.fechaVerificacionCorreo = fechaVerificacionCorreo;
    }
    marcarCorreoComoVerificado() {
        this.correoVerificado = true;
        this.fechaVerificacionCorreo = new Date();
        return this;
    }
}
exports.Usuario = Usuario;
