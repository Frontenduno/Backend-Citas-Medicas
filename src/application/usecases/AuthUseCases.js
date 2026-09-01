const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthRepositoryMySQL = require("../../infrastructure/repositories/AuthRepositoryMySQL");

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_123";

async function registerPaciente(pacienteData) {
  // 1. Validar si el correo ya existe
  const userExists = await AuthRepositoryMySQL.findUsuarioByCorreo(pacienteData.correo);
  if (userExists) {
    throw new Error("El correo ya está registrado");
  }

  // 2. Encriptar contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(pacienteData.contrasena, salt);

  // 3. Preparar datos y llamar al repositorio
  const dataToSave = {
    ...pacienteData,
    contrasena: hashedPassword,
  };

  const result = await AuthRepositoryMySQL.registerPacienteWithTransaction(dataToSave);
  return result;
}

async function login(correo, contrasena) {
  // 1. Buscar usuario
  const usuario = await AuthRepositoryMySQL.findUsuarioByCorreo(correo);
  if (!usuario) {
    throw new Error("Credenciales inválidas");
  }

  // 2. Verificar contraseña
  const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!isMatch) {
    throw new Error("Credenciales inválidas");
  }

  // 3. Generar token de 2 horas
  const payload = {
    idUsuario: usuario.idUsuario,
    rol: usuario.rol,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

  return {
    token,
    usuario: {
      idUsuario: usuario.idUsuario,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol,
    }
  };
}

module.exports = {
  registerPaciente,
  login,
};
