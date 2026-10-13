import { JsonWebTokenGenerator } from '../../../src/infrastructure/service/JsonWebTokenGenerator';
import { Rol } from '../../../src/domain/enum/Rol';

describe('JsonWebTokenGenerator Integration Tests', () => {
  const secret = 'test-secret-key-for-jwt-integration';
  const generator = new JsonWebTokenGenerator(secret, '1h');

  it('debe firmar y luego decodificar un token JWT correctamente', async () => {
    const payload = {
      correo: 'medico@test.com',
      idUsuario: '42',
      rol: Rol.MEDICO,
    };

    const token = await generator.generarToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const decoded = await generator.decodificarToken(token);
    expect(decoded.correo).toBe(payload.correo);
    expect(decoded.idUsuario).toBe(payload.idUsuario);
    expect(decoded.rol).toBe(payload.rol);
  });

  it('debe fallar al decodificar un token manipulado o con firma incorrecta', async () => {
    const generatorDifferentSecret = new JsonWebTokenGenerator('otra-clave-diferente', '1h');
    const token = await generatorDifferentSecret.generarToken({
      correo: 'hacker@test.com',
      idUsuario: '1',
      rol: Rol.PACIENTE,
    });

    await expect(generator.decodificarToken(token)).rejects.toThrow();
  });
});
