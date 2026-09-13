class UsuarioRepository {
  async existsByEmail(email, connection) {
    throw new Error('Not implemented');
  }

  async findByEmail(email, connection) {
    throw new Error('Not implemented');
  }

  async create(usuario, connection) {
    throw new Error('Not implemented');
  }
}

module.exports = {
  UsuarioRepository,
};
