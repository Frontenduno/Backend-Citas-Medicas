import { Paciente } from "../../../src/domain/entities/Paciente";
import { IPacienteRepository } from "../../../src/domain/repositories/PacienteRepository";

describe("PacienteRepository", () => {
  const repository: IPacienteRepository = {
      create: jest.fn().mockImplementation(()=>1),
      findByIdUsuario: jest.fn()
    };

  it("debe registrar paciente", async () => {

    const paciente = new Paciente(null, 1);

    const result = await repository.create(paciente);

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(paciente);
    expect(result).toBe(1);
  });
});
