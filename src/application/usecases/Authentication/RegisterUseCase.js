const { Usuario } = require('../../../domain/entity/Usuario');
const { Paciente } = require('../../../domain/entity/Paciente');
const { UsuarioRepository } = require('../../../domain/repository/UsuarioRepository');
const { PacienteRepository } = require('../../../domain/repository/PacienteRepository');
const { BcryptHasher } = require('../../ports/BcryptHasher');
const { TransactionManager } = require('../../ports/TransactionManager');
const { CorreoRegistradoException } = require('../../exception/CorreoRegistradoException');

class RegisterUseCase {
  constructor({
    usuarioRepository,
    pacienteRepository,
    bcryptHasher,
    transactionManager,
    correoRegistradoException,
  }) {
    this.usuarioRepository = usuarioRepository;
    this.pacienteRepository = pacienteRepository;
    this.bcryptHasher = bcryptHasher;
    this.transactionManager = transactionManager;
    this.correoRegistradoException = correoRegistradoException;
  }

  async execute(nuevoPaciente) {
    let idUsuario;
    await this.transactionManager.withTransaction(async (connection) => {
      if (await this.usuarioRepository.existsByEmail(nuevoPaciente.correo, connection)) {
        throw this.correoRegistradoException;
      }

      const contrasenaHasheada = await this.bcryptHasher.encriptarContrasena(nuevoPaciente.contrasena);

      const newUsuario = new Usuario(
        null,
        contrasenaHasheada,
        nuevoPaciente.nombres,
        nuevoPaciente.apellidos,
        nuevoPaciente.correo,
        nuevoPaciente.telefono,
        'Paciente',
      );

      idUsuario = await this.usuarioRepository.create(newUsuario, connection);

      const newPaciente = new Paciente(
        null,
        nuevoPaciente.DNI,
        nuevoPaciente.fecha_nacimiento,
        idUsuario,
        null,
      );

      await this.pacienteRepository.create(newPaciente, connection);
    });

    return { idUsuario };
  }
}

module.exports = {
  RegisterUseCase,
};
