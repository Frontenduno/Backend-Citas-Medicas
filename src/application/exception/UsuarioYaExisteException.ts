import { BaseException } from "./BaseException";

export class UsuarioYaExisteException extends BaseException {
    constructor() {
        super("El usuario ya se encuentra registrado con este correo");
    }
}
