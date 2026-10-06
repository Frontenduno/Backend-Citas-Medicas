import { BaseException } from "./BaseException";

export class UsuarioNoEncontradoException extends BaseException {
    constructor() {
        super("No se encontró ningún usuario registrado con el correo proporcionado");
    }
}
