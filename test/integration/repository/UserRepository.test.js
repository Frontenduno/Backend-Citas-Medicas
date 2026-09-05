const repository = require("../../../src/infrastructure/repositories/UserRepository");

describe("Test de los metodos de repository", () => {

  test("El email ingresado debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("carlos.gomez@mail.com");
    expect(result).toBe(true);
  });

  test("El email ingresado no debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("randomEmail@example.com");
    expect(result).toBe(false);
  });

  test("Debe retornar un usuario", async () => {
    const result = await repository.findUsuariobyEmail(
      "luis.ramirez@mail.com",
    );
    expect(result != null).toBe(true);
  });

  test("Debe ser nulo", async () => {
    const result = await repository.findUsuariobyEmail(
      "randomEmail@example.com",
    );
    expect(result).toBe(null);
  });
});
