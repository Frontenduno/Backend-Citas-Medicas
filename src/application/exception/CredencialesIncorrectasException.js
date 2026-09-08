class CredencialesIncorrectasException extends Error {
  constructor() {
    super("Credenciales Incorrectas");
    this.name = "CredencialesIncorrectasException";
    Error.captureStackTrace(this, CredencialesIncorrectasException);
  }
}

module.exports = {
    CredencialesIncorrectasException
}