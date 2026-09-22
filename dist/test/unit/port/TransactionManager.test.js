"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TransactionManagerImpl_1 = require("../../../src/infrastructure/database/TransactionManagerImpl");
jest.mock('../../../src/infrastructure/database/PoolConexion');
describe('TransactionManagerImpl', () => {
    const PoolConexion = require('../../../src/infrastructure/database/PoolConexion');
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('debe ejecutar la operacion dentro de una transaccion y hacer commit', async () => {
        const mockConnection = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        };
        PoolConexion.getConnection.mockResolvedValue(mockConnection);
        const operation = jest.fn().mockResolvedValue('result');
        const manager = new TransactionManagerImpl_1.TransactionManagerImpl();
        const result = await manager.withTransaction(operation);
        expect(PoolConexion.getConnection).toHaveBeenCalled();
        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(operation).toHaveBeenCalledWith(mockConnection);
        expect(mockConnection.commit).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
        expect(result).toBe('result');
    });
    it('debe hacer rollback si la operacion falla', async () => {
        const mockConnection = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        };
        PoolConexion.getConnection.mockResolvedValue(mockConnection);
        const operation = jest.fn().mockRejectedValue(new Error('fail'));
        const manager = new TransactionManagerImpl_1.TransactionManagerImpl();
        await expect(manager.withTransaction(operation)).rejects.toThrow('fail');
        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(operation).toHaveBeenCalledWith(mockConnection);
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
        expect(mockConnection.commit).not.toHaveBeenCalled();
    });
});
