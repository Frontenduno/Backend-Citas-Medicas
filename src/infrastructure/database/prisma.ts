import { Prisma, PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

const transactionStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if ((global as any).prisma) {
        prisma = (global as any).prisma;
    } else {
        (global as any).prisma = new PrismaClient();
        prisma = (global as any).prisma;
    }
}

/**
 * Devuelve el cliente transaccional activo o, si no hay transacción,
 * el cliente Prisma global. Permite que los repositorios participen en una
 * transacción sin cambiar sus interfaces de dominio.
 */
export function getPrismaClient(): Prisma.TransactionClient {
    return transactionStorage.getStore() ?? prisma;
}

/**
 * Ejecuta una operación asociando el cliente transaccional al contexto asíncrono.
 */
export function runInTransactionContext<T>(
    client: Prisma.TransactionClient,
    operacion: () => Promise<T>
): Promise<T> {
    return transactionStorage.run(client, operacion);
}

export { prisma };
