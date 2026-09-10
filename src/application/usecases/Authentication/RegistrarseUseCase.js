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
const { Paciente } = require("../../../domain/entity/Paciente");

async function registrarse(nuevoPaciente) {
  await withTransaction(async (connection) => {
    if (await usuarioRepository.existsByEmail(nuevoPaciente.correo)) {
      throw new CorreoRegistradoException();
    }

    const contrasenaHasheada = await encriptarContrasena(
      nuevoPaciente.contrasena,
    );

    const newUsuario = new Usuario(
      null,
      contrasenaHasheada,
      nuevoPaciente.nombres,
      nuevoPaciente.apellidos,
      nuevoPaciente.correo,
      nuevoPaciente.telefono,
      "Paciente",
    );

    const id = await usuarioRepository.create(newUsuario, connection);

    const newPaciente = new Paciente(
      null,
      nuevoPaciente.DNI,
      nuevoPaciente.fecha_nacimiento,
      id,
      null,
    );

    await pacienteRepository.create(newPaciente, connection);
  });
}

module.exports = {
  registrarse,
};
