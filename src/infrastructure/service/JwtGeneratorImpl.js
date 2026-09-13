const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_123';

class JwtGeneratorImpl {
  firmarCredenciales(payload, tiempoExpiracion = null) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: tiempoExpiracion || '1h' });
  }
}

module.exports = {
  JwtGeneratorImpl,
};
