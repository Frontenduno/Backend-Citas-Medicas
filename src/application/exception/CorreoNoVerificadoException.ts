import { BaseException } from "./BaseException";

export class CorreoNoVerificadoException extends BaseException {
    constructor() {
        super("Correo no verificado");
    }
}