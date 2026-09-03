const repository = require("../../../src/infrastructure/repositories/UserRepository");
const { closeConnection } = require("../../../src/infrastructure/database/PoolConexion");

describe("Test de los metodos de repository", () => {
  afterAll(async () => {
    await closeConnection();
  });

  test("El email ingresado no debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("randomEmail@example.com");
    expect(result).toBe(false);
  });

  test("El email ingresado debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("mgomez@citasmedicas.com");
    expect(result).toBe(true);
  });

  test("Debe retornar un usuario", async () => {
    const result = await repository.findUsuariobyEmail(
      "luis.infantes@email.com",
    );
    expect(result.nombres).toBe("Luis Ricardo");
  });

  test("Debe ser nulo", async () => {
    const result = await repository.findUsuariobyEmail(
      "randomEmail@example.com",
    );
    expect(result != null).toBe(false);
  });
});
