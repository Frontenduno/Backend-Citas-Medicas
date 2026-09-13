const { UsuarioRepository } = require('../../../domain/repository/UsuarioRepository');
const { BcryptHasher } = require('../../ports/BcryptHasher');
const { JwtGenerator } = require('../../ports/JwtGenerator');
const { CredencialesIncorrectasException } = require('../../exception/CredencialesIncorrectasException');

class LoginUseCase {
  constructor({
    usuarioRepository,
    bcryptHasher,
    jwtGenerator,
    credencialesIncorrectasException,
  }) {
    this.usuarioRepository = usuarioRepository;
    this.bcryptHasher = bcryptHasher;
    this.jwtGenerator = jwtGenerator;
    this.credencialesIncorrectasException = credencialesIncorrectasException;
  }

  async execute(correo, contrasena) {
    const usuario = await this.usuarioRepository.findByEmail(correo);

    if (!usuario || !(await this.bcryptHasher.compararContrasenas(contrasena, usuario.contrasena))) {
      throw this.credencialesIncorrectasException;
    }

    const payload = { correo: usuario.correo, rol: usuario.rol };
    const token = this.jwtGenerator.firmarCredenciales(payload);

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
}

module.exports = {
  LoginUseCase,
};
