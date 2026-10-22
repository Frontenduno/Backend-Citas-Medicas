import { BaseException } from "./BaseException";

export class EmailNoEnviadoException extends BaseException {
    constructor(causa?: unknown) {
        super("No se pudo enviar el correo. Por favor, intente nuevamente.");
        this.name = "EmailNoEnviadoException";
        if (causa !== undefined) {
            this.cause = causa;
        }
    }
}
