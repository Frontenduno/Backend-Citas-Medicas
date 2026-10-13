import { BaseException } from "./BaseException";

export class CodigoInvalidoException extends BaseException {
    constructor() {
        super("El código de verificación es incorrecto o no existe");
    }
}
