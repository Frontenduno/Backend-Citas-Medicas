"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidacionException = void 0;
const AppException_1 = require("./AppException");
class ValidacionException extends AppException_1.AppException {
    constructor(message) {
        super(message);
        this.code = 'VALIDACION';
        this.httpStatus = 400;
    }
}
exports.ValidacionException = ValidacionException;
