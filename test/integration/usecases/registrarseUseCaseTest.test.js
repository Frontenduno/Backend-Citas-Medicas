const {
  registrarse,
} = require("../../../src/application/usecases/Authentication/RegistrarseUseCase");
const {
  existsByEmail,
} = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");

describe("RegistrarseUsecase", () => {
  const email = `rollback_${Date.now()}@test.com`;
  const timestamp = Date.now();

  const testUser = {
    correo: `juan.perez${timestamp}@example.com`,
    contrasena: "secreta123",
    nombres: "Juan",
    apellidos: "Perez",
    telefono: "987654321",
    DNI: `123${timestamp.toString().slice(-5)}`,
    fecha_nacimiento: "1990-01-01",
  };

  const emailGenerated = testUser.correo;

  it("Debe registrar nuevo usuario con rol paciente", async () => {
    await registrarse(testUser);

    const PacienteRegistrado = await existsByEmail(emailGenerated);

    expect(PacienteRegistrado).toBe(true);
  });
});
