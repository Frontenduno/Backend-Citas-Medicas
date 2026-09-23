import { getConnection, closeConnection } from '../../../src/infrastructure/database/PoolConexion';
import { RowDataPacket } from 'mysql2/promise';

describe('Test de la conexión a la base de datos (TypeScript)', () => {
  afterAll(async () => {
    await closeConnection();
  });

  test('Debe conectarse a la base de datos exitosamente', async () => {
    const conexion = await getConnection();

    try {
      const [rows] = await conexion.execute<RowDataPacket[]>(
        "SELECT 'Conexion Exitosa' as result",
      );

      expect(rows[0].result).toBe('Conexion Exitosa');
    } finally {
      conexion.release();
    }
  });
});

