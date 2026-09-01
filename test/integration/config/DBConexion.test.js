const DBConexion = require("../../../src/configuration/DBConexion");

describe("Test de la conexion a la base de datos", () => {
  test("Debe conectarse a la base de datos", async () => {
    const connection = DBConexion.getConnection();

    try {
      const [rows] = await connection.execute(
        "SELECT 'Conexion Existosa' as result",
      );

      expect(rows[0].result).toBe("Conexion Exitosa");
    } finally {
      DBConexion.returnConnection();
    }
  });
});
