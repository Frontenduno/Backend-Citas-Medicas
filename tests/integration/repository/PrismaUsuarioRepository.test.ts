import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

describe('PrismaUsuarioRepository Integration Tests', () => {
  const repository = new PrismaUsuarioRepository();
  let secuenciaDocumento = 0;

  // documento_identidad es VARCHAR(20) y telefono VARCHAR(15):
  // se generan valores numéricos cortos y únicos para cada usuario.
  const generarDocumento = (): string => {
    secuenciaDocumento += 1;
    return String(10000000 + secuenciaDocumento);
  };

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
    secuenciaDocumento = 0;
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  const buildUsuario = (suffix: string = '1'): Usuario => {
    return new Usuario(
      0,
      '$2a$10$dummyhashedpasswordfortesting',
      `Juan${suffix}`,
      `Perez${suffix}`,
      `juan${suffix}@example.com`,
      generarDocumento(),
      '987654321',
      Genero.MASCULINO,
      new Date('1990-01-01'),
      Rol.PACIENTE,
      false
    );
  };

  it('debe persistir un nuevo usuario en la base de datos (save)', async () => {
    const usuario = buildUsuario('save');
    const guardado = await repository.save(usuario);

    expect(guardado.idUsuario).toBeGreaterThan(0);
    expect(guardado.correo).toBe('juansave@example.com');
    expect(guardado.nombres).toBe('Juansave');
    expect(guardado.verificado).toBe(false);
  });

  it('debe encontrar un usuario por su ID (findById)', async () => {
    const guardado = await repository.save(buildUsuario('findbyid'));
    const encontrado = await repository.findById(guardado.idUsuario);

    expect(encontrado).not.toBeNull();
    expect(encontrado?.idUsuario).toBe(guardado.idUsuario);
    expect(encontrado?.correo).toBe(guardado.correo);
  });

  it('debe retornar null cuando el ID no existe', async () => {
    const encontrado = await repository.findById(999999);
    expect(encontrado).toBeNull();
  });

  it('debe encontrar un usuario por correo electrónico (findByCorreo)', async () => {
    await repository.save(buildUsuario('findbycorreo'));
    const encontrado = await repository.findByCorreo('juanfindbycorreo@example.com');

    expect(encontrado).not.toBeNull();
    expect(encontrado?.correo).toBe('juanfindbycorreo@example.com');
  });

  it('debe retornar null cuando el correo no existe', async () => {
    const encontrado = await repository.findByCorreo('noexiste@example.com');
    expect(encontrado).toBeNull();
  });

  it('debe encontrar un usuario por documento de identidad (findByDocumento)', async () => {
    const guardado = await repository.save(buildUsuario('findbydoc'));
    const encontrado = await repository.findByDocumento(guardado.documento_identidad);

    expect(encontrado).not.toBeNull();
    expect(encontrado?.documento_identidad).toBe(guardado.documento_identidad);
  });

  it('debe actualizar los datos de un usuario existente (update)', async () => {
    const guardado = await repository.save(buildUsuario('update'));
    const actualizado = await repository.update(guardado.idUsuario, {
      nombres: 'Carlos',
      verificado: true,
      telefono: '999888777',
    });

    expect(actualizado.nombres).toBe('Carlos');
    expect(actualizado.verificado).toBe(true);
    expect(actualizado.telefono).toBe('999888777');

    const verificadoEnDb = await repository.findById(guardado.idUsuario);
    expect(verificadoEnDb?.nombres).toBe('Carlos');
    expect(verificadoEnDb?.verificado).toBe(true);
  });

  it('debe eliminar un usuario de la base de datos (delete)', async () => {
    const guardado = await repository.save(buildUsuario('delete'));
    await repository.delete(guardado.idUsuario);

    const encontrado = await repository.findById(guardado.idUsuario);
    expect(encontrado).toBeNull();
  });

  it('debe retornar todos los usuarios existentes (findAll)', async () => {
    await repository.save(buildUsuario('all1'));
    await repository.save(buildUsuario('all2'));

    const todos = await repository.findAll();
    expect(todos.length).toBe(2);
    expect(todos.some((u) => u.correo === 'juanall1@example.com')).toBe(true);
    expect(todos.some((u) => u.correo === 'juanall2@example.com')).toBe(true);
  });
});
