import { BaseException } from "./BaseException";

export class CodigoExpiradoException extends BaseException {
    constructor() {
        super("El código de verificación ha expirado. Por favor solicita uno nuevo");
    }
}
