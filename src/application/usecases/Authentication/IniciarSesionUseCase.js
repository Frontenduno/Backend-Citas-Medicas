const { compararContrasenas } = require("../../ports/BcryptHasher");
const { firmarCredenciales } = require("../../ports/JwtGenerator");
const usuarioRepository = require("../../../infrastructure/repositories/UserRepositoryMySQL");
const {
  CredencialesIncorrectasException,
} = require("../../exception/CredencialesIncorrectasException");

async function iniciarSesion(correo, contrasena) {
  const usuario = await usuarioRepository.findUsuariobyEmail(correo);

  if (usuario == null || !(await compararContrasenas(contrasena, usuario.contrasena))) {
    throw new CredencialesIncorrectasException();
  }

  const payload = { correo: usuario.correo, rol: usuario.rol };

  return firmarCredenciales(payload);
}

module.exports = {
  iniciarSesion,
};
