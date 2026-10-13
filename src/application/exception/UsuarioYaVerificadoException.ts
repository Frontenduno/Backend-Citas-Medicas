import { BaseException } from "./BaseException";

export class UsuarioYaVerificadoException extends BaseException {
    constructor() {
        super("El usuario ya se encuentra verificado");
    }
}
