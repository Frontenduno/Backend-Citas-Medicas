const repository = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");
const { Usuario } = require("../../../src/domain/entity/Usuario");

describe("Test de los metodos de repository", () => {
  test("El email ingresado debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("carlos.gomez@mail.com");
    expect(result).toBe(true);
  });

  test("El email ingresado no debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("randomEmail@example.com");
    expect(result).toBe(false);
  });

  test("El email ingresado debe existir en la base de datos", async () => {
    const result = await repository.existsByEmail("juan.perez@example.com");
    expect(result).toBe(true);
  });

  test("Debe retornar un usuario", async () => {
    const result = await repository.findUsuariobyEmail(
      "ale.perez@example.com",
    );
    expect(result != null).toBe(true);
  });

  test("Debe ser nulo", async () => {
    const result = await repository.findUsuariobyEmail(
      "randomEmail@example.com",
    );
    expect(result).toBe(null);
  });

  test("Debe registrar Usuario", async () => {
    const usuario = new Usuario(
      null,
      "password123",
      "Usuario",
      "Rollback",
      "usuario.example.com",
      "999999999",
      "PACIENTE",
    );

    const result = await repository.create(usuario);
    expect(result != null).toBe(true);
  });
});
