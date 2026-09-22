"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
class Paciente {
    constructor(idPaciente, idUsuario) {
        this.idPaciente = idPaciente ?? undefined;
        this.idUsuario = idUsuario;
    }
}
exports.Paciente = Paciente;
