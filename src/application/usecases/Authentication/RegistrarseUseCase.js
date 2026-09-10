const { encriptarContrasena } = require("../../ports/BcryptHasher");
const usuarioRepository = require("../../../infrastructure/repositories/UserRepositoryMySQL");
const pacienteRepository = require("../../../infrastructure/repositories/PacienteRepositoryMySQL");
const {
  withTransaction,
} = require("../../../infrastructure/database/TransactionManager");
const {
  CorreoRegistradoException,
} = require("../../../application/exception/CorreoRegistradoException");
const { Usuario } = require("../../../domain/entity/Usuario");

async function registrarse(nuevoPaciente) {
  withTransaction(async (connection) => {
    if (usuarioRepository.existsByEmail(nuevoPaciente.correo)) {
      throw new CorreoRegistradoException();
    }

    const newUsuario = new Usuario(
      null,
      nuevoPaciente.contrasena,
      nuevoPaciente.nombres,
      nuevoPaciente.apellidos,
      nuevoPaciente.correo,
      nuevoPaciente.telefono,
      "Paciente",
    );

    const id = usuarioRepository.create();
  });
}
