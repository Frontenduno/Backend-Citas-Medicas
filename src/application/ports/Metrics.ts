export interface Metrics {
  incrementar(nombre: string, tags?: Record<string, string>): void;
  observar(nombre: string, valor: number, tags?: Record<string, string>): void;
}

