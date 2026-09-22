"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodigoIncorrectoException = void 0;
const AppException_1 = require("./AppException");
class CodigoIncorrectoException extends AppException_1.AppException {
    constructor(message = 'El código de verificación es incorrecto') {
        super(message);
        this.code = 'CODIGO_INCORRECTO';
        this.httpStatus = 400;
    }
}
exports.CodigoIncorrectoException = CodigoIncorrectoException;
