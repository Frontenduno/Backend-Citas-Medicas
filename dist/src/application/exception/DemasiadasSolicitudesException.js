"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemasiadasSolicitudesException = void 0;
const AppException_1 = require("./AppException");
class DemasiadasSolicitudesException extends AppException_1.AppException {
    constructor(message = 'Has realizado demasiadas solicitudes en muy poco tiempo. Intenta más tarde.') {
        super(message);
        this.code = 'DEMASIADAS_SOLICITUDES';
        this.httpStatus = 429;
    }
}
exports.DemasiadasSolicitudesException = DemasiadasSolicitudesException;
