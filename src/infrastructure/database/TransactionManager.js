const { getConnection } = require("../database/PoolConexion");

async function withTransaction(operation) {
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

module.exports = {
  withTransaction,
};
