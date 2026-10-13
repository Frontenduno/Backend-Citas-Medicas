import { PrismaCodigoVerificacionRepository } from '../../../src/infrastructure/repository/PrismaCodigoVerificacionRepository';
import { CodigoVerificacion } from '../../../src/domain/entity/CodigoVerificacion';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

describe('PrismaCodigoVerificacionRepository Integration Tests', () => {
  const repository = new PrismaCodigoVerificacionRepository();

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  const buildCodigo = (correo: string = 'test@example.com', codigo: string = '123456'): CodigoVerificacion => {
    const expiration = new Date(Date.now() + 15 * 60 * 1000);
    return new CodigoVerificacion(0, correo, codigo, expiration);
  };

  it('debe persistir un código de verificación en la base de datos (save)', async () => {
    const codigo = buildCodigo('user@test.com', '654321');
    const guardado = await repository.save(codigo);

    expect(guardado.idCodigoVerificacion).toBeGreaterThan(0);
    expect(guardado.correo).toBe('user@test.com');
    expect(guardado.codigo).toBe('654321');
  });

  it('debe encontrar el código más reciente por correo y código (findByCorreoYCodigo)', async () => {
    const exp1 = new Date(Date.now() + 10 * 60 * 1000);
    const exp2 = new Date(Date.now() + 20 * 60 * 1000);

    await repository.save(new CodigoVerificacion(0, 'verify@test.com', '111111', exp1));
    const masReciente = await repository.save(new CodigoVerificacion(0, 'verify@test.com', '111111', exp2));

    const encontrado = await repository.findByCorreoYCodigo('verify@test.com', '111111');

    expect(encontrado).not.toBeNull();
    expect(encontrado?.correo).toBe('verify@test.com');
    expect(encontrado?.codigo).toBe('111111');
  });

  it('debe retornar null cuando el código o correo no coinciden', async () => {
    await repository.save(buildCodigo('existing@test.com', '123456'));

    const noExisteCorreo = await repository.findByCorreoYCodigo('other@test.com', '123456');
    const noExisteCodigo = await repository.findByCorreoYCodigo('existing@test.com', '999999');

    expect(noExisteCorreo).toBeNull();
    expect(noExisteCodigo).toBeNull();
  });

  it('debe eliminar todos los códigos asociados a un correo (deleteByCorreo)', async () => {
    await repository.save(buildCodigo('todelete@test.com', '111111'));
    await repository.save(buildCodigo('todelete@test.com', '222222'));

    await repository.deleteByCorreo('todelete@test.com');

    const check1 = await repository.findByCorreoYCodigo('todelete@test.com', '111111');
    const check2 = await repository.findByCorreoYCodigo('todelete@test.com', '222222');

    expect(check1).toBeNull();
    expect(check2).toBeNull();
  });
});
