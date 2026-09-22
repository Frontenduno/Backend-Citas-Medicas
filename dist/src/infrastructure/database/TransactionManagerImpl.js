"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManagerImpl = void 0;
const PoolConexion_1 = require("./PoolConexion");
class TransactionManagerImpl {
    async withTransaction(operation) {
        const connection = await (0, PoolConexion_1.getConnection)();
        try {
            await connection.beginTransaction();
            const result = await operation(connection);
            await connection.commit();
            return result;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
}
exports.TransactionManagerImpl = TransactionManagerImpl;
