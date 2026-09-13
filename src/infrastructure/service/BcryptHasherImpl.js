const bcrypt = require('bcryptjs');

class BcryptHasherImpl {
  async encriptarContrasena(contrasena) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
  }

  async compararContrasenas(contrasenaIngresada, contrasenaHasheada) {
    return await bcrypt.compare(contrasenaIngresada, contrasenaHasheada);
  }
}

module.exports = {
  BcryptHasherImpl,
};
