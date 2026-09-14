"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Paciente_1 = require("../../../src/domain/entity/Paciente");
describe("PacienteRepository", () => {
    const repository = {
        create: jest.fn().mockImplementation(() => 1),
    };
    it("debe registrar paciente", async () => {
        const paciente = new Paciente_1.Paciente(null, 1);
        const result = await repository.create(paciente);
        expect(repository.create).toHaveBeenCalledTimes(1);
        expect(repository.create).toHaveBeenCalledWith(paciente);
        expect(result).toBe(1);
    });
});
