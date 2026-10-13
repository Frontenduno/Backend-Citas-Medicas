import { RandomCodeGenerator } from '../../../src/infrastructure/service/RandomCodeGenerator';

describe('RandomCodeGenerator Integration Tests', () => {
  it('debe generar códigos numéricos de 6 dígitos por defecto', () => {
    const generator = new RandomCodeGenerator(6);

    for (let i = 0; i < 20; i++) {
      const code = generator.generateCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    }
  });

  it('debe generar códigos de diferente longitud según configuración', () => {
    const generator4 = new RandomCodeGenerator(4);
    const code = generator4.generateCode();
    expect(code).toMatch(/^\d{4}$/);
    expect(code.length).toBe(4);
  });
});
