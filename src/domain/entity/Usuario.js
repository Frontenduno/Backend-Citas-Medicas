class Usuario {
  constructor(
    idUsuario,
    contrasena,
    nombres,
    apellidos,
    correo,
    telefono,
    rol,
  ) {
    this.idUsuario = idUsuario;
    this.contrasena = contrasena;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.correo = correo;
    this.telefono = telefono;
    this.rol = rol;
  }
}

module.exports = {
  Usuario,
};
