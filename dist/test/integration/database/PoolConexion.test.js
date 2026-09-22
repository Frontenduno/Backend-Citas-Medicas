"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PoolConexion_1 = require("../../../src/infrastructure/database/PoolConexion");
describe('PoolConexion', () => {
    afterAll(async () => {
        await (0, PoolConexion_1.closeConnection)();
    });
    test('debe conectarse a la base de datos', async () => {
        const conexion = await (0, PoolConexion_1.getConnection)();
        expect(conexion).toBeDefined();
        expect(typeof conexion.execute).toBe('function');
        conexion.release();
    });
});
