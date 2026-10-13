import { BcryptPasswordHasher } from '../../../src/infrastructure/service/BcryptPasswordHasher';

describe('BcryptPasswordHasher Integration Tests', () => {
  const hasher = new BcryptPasswordHasher(10);

  it('debe generar un hash bcrypt válido y diferente de la contraseña plana', async () => {
    const raw = 'MiPasswordSeguro123!';
    const hash = await hasher.hashearContrasena(raw);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(raw);
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('debe comparar exitosamente una contraseña correcta contra su hash', async () => {
    const raw = 'PasswordCorrecto2026';
    const hash = await hasher.hashearContrasena(raw);

    const coincide = await hasher.compararContrasena(raw, hash);
    expect(coincide).toBe(true);
  });

  it('debe rechazar una contraseña incorrecta contra el hash', async () => {
    const raw = 'PasswordOriginal';
    const hash = await hasher.hashearContrasena(raw);

    const coincide = await hasher.compararContrasena('PasswordEquivocado', hash);
    expect(coincide).toBe(false);
  });
});
