import { BaseException } from "./BaseException";

export class CredencialesIncorrectasException extends BaseException {
    constructor() {
        super("Credenciales incorrectas");
    }
}