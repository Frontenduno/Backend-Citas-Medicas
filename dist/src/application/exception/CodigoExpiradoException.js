"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodigoExpiradoException = void 0;
const AppException_1 = require("./AppException");
class CodigoExpiradoException extends AppException_1.AppException {
    constructor(message = 'El código de verificación ha expirado') {
        super(message);
        this.code = 'CODIGO_EXPIRADO';
        this.httpStatus = 400;
    }
}
exports.CodigoExpiradoException = CodigoExpiradoException;
