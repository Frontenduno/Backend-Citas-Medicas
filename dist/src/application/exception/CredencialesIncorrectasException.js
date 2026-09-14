"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredencialesIncorrectasException = void 0;
class CredencialesIncorrectasException extends Error {
    constructor() {
        super('Credenciales Incorrectas');
        this.name = 'CredencialesIncorrectasException';
        Error.captureStackTrace(this, CredencialesIncorrectasException);
    }
}
exports.CredencialesIncorrectasException = CredencialesIncorrectasException;
