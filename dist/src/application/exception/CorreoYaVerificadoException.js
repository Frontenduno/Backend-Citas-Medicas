"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorreoYaVerificadoException = void 0;
const AppException_1 = require("./AppException");
class CorreoYaVerificadoException extends AppException_1.AppException {
    constructor(message = 'Este correo electrónico ya ha sido verificado') {
        super(message);
        this.code = 'CORREO_YA_VERIFICADO';
        this.httpStatus = 400;
    }
}
exports.CorreoYaVerificadoException = CorreoYaVerificadoException;
