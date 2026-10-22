import { TransactionManager } from '../../application/port/TransactionManager';
import { prisma, runInTransactionContext } from './prisma';

export class PrismaTransactionManager implements TransactionManager {
  async ejecutar<T>(operacion: () => Promise<T>): Promise<T> {
    return prisma.$transaction(
      (tx) => runInTransactionContext(tx, operacion),
      {
        // El envío del correo ocurre dentro de la transacción, por lo que se
        // requiere un timeout mayor al predeterminado de Prisma (5 s).
        maxWait: 5000,
        timeout: 20000,
      }
    );
  }
}
