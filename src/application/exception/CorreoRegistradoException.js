class CorreoRegistradoException extends Error {
  constructor() {
    super("Este correo ya existe en esta plataforma...");
    this.name = "CorreoRegistradoException";
    Error.captureStackTrace(this, CorreoRegistradoException);
  }
}

module.exports = {
  CorreoRegistradoException,
};
