"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactoEmergencia = void 0;
class ContactoEmergencia {
    constructor(idContactoEmergencia, telefono, correo, nombres, apellidos, parentesco, pacienteId) {
        this.idContactoEmergencia = idContactoEmergencia ?? undefined;
        this.telefono = telefono;
        this.correo = correo;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.parentesco = parentesco;
        this.pacienteId = pacienteId ?? undefined;
    }
}
exports.ContactoEmergencia = ContactoEmergencia;
