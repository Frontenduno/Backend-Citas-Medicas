const DBConexion = require("../../../src/infrastructure/database/PoolConexion");

describe("Test de la conexion a la base de datos", () => {
  test("Debe conectarse a la base de datos", async () => {
    const conexion = await DBConexion.getConnection();

    try {
      const [rows] = await conexion.execute(
        "SELECT 'Conexion Exitosa' as result",
      );

      expect(rows[0].result).toBe("Conexion Exitosa");
    } finally {
      conexion.release();
    }
  });
});
