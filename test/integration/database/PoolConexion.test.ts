import { closeConnection, getConnection } from '../../../src/infrastructure/database/PoolConexion';

describe('PoolConexion', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('debe conectarse a la base de datos', async () => {
    const conexion = await getConnection();
    expect(conexion).toBeDefined();
    expect(typeof conexion.execute).toBe('function');
    conexion.release();
  });
});
