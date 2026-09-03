const repository = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");
const {
  closeConnection,
} = require("../../../src/infrastructure/database/PoolConexion");

describe("Test de los metodos de repository", () => {
  afterAll(async () => {
    await closeConnection();
  });

  test("El email ingresado no debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("randomEmail@example.com");
    expect(result).toBe(false);
  });

  test("El email ingresado debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("luis.ramirez@mail.com");
    expect(result).toBe(true);
  });

  test("Debe retornar un usuario", async () => {
    const result = await repository.findUsuariobyEmail("luis.ramirez@mail.com");
    expect(result.nombres).toBe("Luis");
  });

  test("Debe ser nulo", async () => {
    const result = await repository.findUsuariobyEmail(
      "randomEmail@example.com",
    );
    expect(result != null).toBe(false);
  });
});
