"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorreoRegistradoException = void 0;
class CorreoRegistradoException extends Error {
    constructor() {
        super('Este correo ya existe en esta plataforma...');
        this.name = 'CorreoRegistradoException';
        Error.captureStackTrace(this, CorreoRegistradoException);
    }
}
exports.CorreoRegistradoException = CorreoRegistradoException;
