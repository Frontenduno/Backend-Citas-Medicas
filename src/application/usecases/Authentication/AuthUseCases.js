const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../../infrastructure/database/PoolConexion");
const UsuarioRepository = require("../../infrastructure/repositories/UsuarioRepository");
const PacienteRepository = require("../../infrastructure/repositories/PacienteRepository");
const ContactoEmergenciaRepository = require("../../infrastructure/repositories/ContactoEmergenciaRepository");

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_123";

async function registerPaciente(pacienteData) {
  // 1. Validar si el correo ya existe
  const userExists = await UsuarioRepository.findUsuarioByCorreo(pacienteData.correo);
  if (userExists) {
    throw new Error("El correo ya está registrado");
  }

  // 2. Encriptar contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(pacienteData.contrasena, salt);

  // 3. Preparar datos
  const dataToSave = {
    correo: pacienteData.correo,
    nombres: pacienteData.nombres,
    apellidos: pacienteData.apellidos,
    telefono: pacienteData.telefono,
    DNI: pacienteData.DNI,
    fecha_nacimiento: pacienteData.fecha_nacimiento,
    contrasena: hashedPassword,
  };

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    let idContactoEmergencia = null;
    
    // Solo registrar contacto de emergencia si se envían los datos
    if (dataToSave.contacto_telefono && dataToSave.contacto_nombres) {
      idContactoEmergencia = await ContactoEmergenciaRepository.createContactoEmergencia(connection, dataToSave);
    }

    const idUsuario = await UsuarioRepository.createUsuario(connection, dataToSave);

    dataToSave.idUsuario = idUsuario;
    dataToSave.idContactoEmergencia = idContactoEmergencia;

    await PacienteRepository.createPaciente(connection, dataToSave);

    await connection.commit();
    
    // Generar token de 2 horas para el nuevo usuario
    const token = jwt.sign({ idUsuario, rol: 'PACIENTE' }, JWT_SECRET, { expiresIn: '2h' });
    return {
      success: true,
      idUsuario,
      mensaje: "Paciente registrado correctamente",
      token,
    };
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function login(correo, contrasena) {
  // 1. Buscar usuario
  const usuario = await UsuarioRepository.findUsuarioByCorreo(correo);
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

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

  return {
    token,
    usuario: {
      idUsuario: usuario.idUsuario,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
}

module.exports = {
  registerPaciente,
  login,
};
