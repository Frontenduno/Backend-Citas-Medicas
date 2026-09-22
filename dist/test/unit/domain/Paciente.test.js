"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Paciente_1 = require("../../../src/domain/entity/Paciente");
describe('Paciente', () => {
    it('debe crear una instancia de Paciente con los valores proporcionados', () => {
        const paciente = new Paciente_1.Paciente(1, 2);
        expect(paciente.idPaciente).toBe(1);
        expect(paciente.idUsuario).toBe(2);
    });
});
