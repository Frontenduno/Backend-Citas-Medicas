const PoolConexion = require('../../../src/infrastructure/database/PoolConexion');

describe('PoolConexion', () => {
  afterAll(async () => {
    await PoolConexion.closeConnection();
  });

  test('debe conectarse a la base de datos', async () => {
    const conexion = await PoolConexion.getConnection();
    expect(conexion).toBeDefined();
    expect(typeof conexion.execute).toBe('function');
    conexion.release();
  });
});
