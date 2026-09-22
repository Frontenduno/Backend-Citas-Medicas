"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserRepositoryMySQL_1 = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");
const Usuario_1 = require("../../../src/domain/entity/Usuario");
const PoolConexion_1 = require("../../../src/infrastructure/database/PoolConexion");
describe('UsuarioRepositoryMySQL', () => {
    afterAll(async () => {
        await (0, PoolConexion_1.closeConnection)();
    });
    test('El email ingresado debe existir en la base de datos', async () => {
        const repository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
        const result = await repository.existsByEmail('carlos.mendoza@medico.com');
        expect(result).toBe(true);
    });
    test('El email ingresado no debe existir en la base de datos', async () => {
        const repository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
        const result = await repository.existsByEmail('randomEmail@example.com');
        expect(result).toBe(false);
    });
    test('Debe retornar un usuario', async () => {
        const repository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
        const result = await repository.findByEmail('carlos.mendoza@medico.com');
        expect(result != null).toBe(true);
    });
    test('Debe ser nulo', async () => {
        const repository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
        const result = await repository.findByEmail('randomEmail@example.com');
        expect(result).toBe(null);
    });
    test('Debe registrar Usuario', async () => {
        const repository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
        const connection = await (0, PoolConexion_1.getConnection)();
        try {
            await connection.beginTransaction();
            const email = `rollback_${Date.now()}@test.com`;
            const usuario = new Usuario_1.Usuario(null, 'password123', 'Usuario', 'Rollback', email, '999999999', '1990-01-01', 'Masculino', 'PACIENTE');
            const result = await repository.create(usuario, connection);
            expect(result).toBeGreaterThan(0);
            await connection.rollback();
        }
        finally {
            connection.release();
        }
    });
});
