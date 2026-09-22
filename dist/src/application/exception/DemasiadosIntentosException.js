"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemasiadosIntentosException = void 0;
const AppException_1 = require("./AppException");
class DemasiadosIntentosException extends AppException_1.AppException {
    constructor(message = 'Has superado el límite de intentos permitidos') {
        super(message);
        this.code = 'DEMASIADOS_INTENTOS';
        this.httpStatus = 429;
    }
}
exports.DemasiadosIntentosException = DemasiadosIntentosException;
