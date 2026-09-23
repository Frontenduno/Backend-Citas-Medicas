import { Paciente } from "../../../src/domain/entity/Paciente";
import { IPacienteRepository } from "../../../src/domain/repository/PacienteRepository";

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
