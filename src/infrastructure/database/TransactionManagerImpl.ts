import { getConnection } from './PoolConexion';
import { ITransactionManager } from '../../application/ports/TransactionManager';

export class TransactionManagerImpl implements ITransactionManager {
  async withTransaction<T>(operation: (connection: any) => Promise<T>): Promise<T> {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();
      const result = await operation(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
