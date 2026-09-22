export interface CodeGenerator {
  generar(): { codigo: string; codigoHash: string };
  hashear(codigo: string): string;
}

