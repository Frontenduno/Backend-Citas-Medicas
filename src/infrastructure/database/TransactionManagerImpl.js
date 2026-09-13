const { getConnection } = require('../database/PoolConexion');

class TransactionManagerImpl {
  async withTransaction(operation) {
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

module.exports = {
  TransactionManagerImpl,
};
