"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TransactionManagerImpl_1 = require("../../../src/infrastructure/database/TransactionManagerImpl");
const PoolConexion_1 = require("../../../src/infrastructure/database/PoolConexion");
const UserRepositoryMySQL_1 = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");
const Usuario_1 = require("../../../src/domain/entity/Usuario");
describe('TransactionManagerImpl', () => {
    afterAll(async () => {
        await (0, PoolConexion_1.closeConnection)();
    });
    test('debe hacer rollback cuando ocurre un error durante la operacion', async () => {
        const manager = new TransactionManagerImpl_1.TransactionManagerImpl();
        const usuarioRepository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
        const email = `rollback_${Date.now()}@test.com`;
        const usuario = new Usuario_1.Usuario(null, 'password123', 'Usuario', 'Rollback', email, '999999999', '1990-01-01', 'Masculino', 'PACIENTE');
        await expect(manager.withTransaction(async (connection) => {
            await usuarioRepository.create(usuario, connection);
            throw new Error('Error intencional para probar rollback');
        })).rejects.toThrow('Error intencional para probar rollback');
        const exists = await usuarioRepository.existsByEmail(email);
        expect(exists).toBe(false);
    });
});
