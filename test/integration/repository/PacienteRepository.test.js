const { Paciente } = require("../../../src/domain/entity/Paciente");
const { Usuario } = require("../../../src/domain/entity/Usuario");
const pacienteRepository = require("../../../src/infrastructure/repositories/PacienteRepositoryMySQL");
const usuarioRepository = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");

describe("PacienteRepositoryMySQL", () => {
  test("Debe registar paciente", async () => {
    const email = `testing_${Date.now()}@test.com`;

    const usuario = new Usuario(
      null,
      "password123",
      "Usuario",
      "Rollback",
      email,
      "999999999",
      "Paciente",
    );

    const usuarioId = await usuarioRepository.create(usuario);

    const paciente = new Paciente(
      null,
      "74192479",
      "1990-05-14",
      usuarioId,
      null,
    );

    const pacienteId = await pacienteRepository.create(paciente);

    expect(pacienteId != null).toBe(true);
  });
});
