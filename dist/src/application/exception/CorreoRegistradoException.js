"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorreoRegistradoException = void 0;
const AppException_1 = require("./AppException");
class CorreoRegistradoException extends AppException_1.AppException {
    constructor(message = 'Este correo no existe en esta plataforma...') {
        super(message);
        this.code = 'CORREO_NO_REGISTRADO';
        this.httpStatus = 404;
    }
}
exports.CorreoRegistradoException = CorreoRegistradoException;
