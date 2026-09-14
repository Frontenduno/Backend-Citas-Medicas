export interface ITransactionManager {
  withTransaction<T>(operation: (connection: any) => Promise<T>): Promise<T>;
}
