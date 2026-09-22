"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredencialesIncorrectasException = void 0;
const AppException_1 = require("./AppException");
class CredencialesIncorrectasException extends AppException_1.AppException {
    constructor(message = 'Credenciales Incorrectas') {
        super(message);
        this.code = 'CREDENCIALES_INCORRECTAS';
        this.httpStatus = 401;
    }
}
exports.CredencialesIncorrectasException = CredencialesIncorrectasException;
