const { withTransaction } = require("../../../src/infrastructure/database/TransactionManager");
const usuarioRepository = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");
const { closeConnection } = require("../../../src/infrastructure/database/PoolConexion");
const { Usuario } = require("../../../src/domain/entity/Usuario");

describe("withTransaction", () => {

  afterAll(async () => {
    await closeConnection();
  });

  test("debe hacer rollback cuando ocurre un error durante la operación", async () => {

    const email = `rollback_${Date.now()}@test.com`;

    const usuario = new Usuario(
      null,
      "password123",
      "Usuario",
      "Rollback",
      email,
      "999999999",
      "PACIENTE",
    );

    await expect(
      withTransaction(async (connection) => {

        // 1. Insertamos dentro de la transacción
        await usuarioRepository.create(usuario, connection);

        // 2. Provocamos deliberadamente un error
        throw new Error("Error intencional para probar rollback");
      }),
    ).rejects.toThrow("Error intencional para probar rollback");

    // 3. Comprobamos que el INSERT fue revertido
    const exists = await usuarioRepository.existsByEmail(email);

    expect(exists).toBe(false);
  });
});