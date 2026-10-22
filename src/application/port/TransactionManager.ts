export interface TransactionManager {
    /**
     * Ejecuta una operación dentro de una transacción.
     * Si la operación lanza, todos los cambios persistidos deben revertirse.
     */
    ejecutar<T>(operacion: () => Promise<T>): Promise<T>;
}
