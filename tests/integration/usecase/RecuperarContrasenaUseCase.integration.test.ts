import { RecuperarContrasenaUseCase } from '../../../src/application/usecase/auth/RecuperarContrasenaUseCase';
import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { PrismaCodigoVerificacionRepository } from '../../../src/infrastructure/repository/PrismaCodigoVerificacionRepository';
import { BcryptPasswordHasher } from '../../../src/infrastructure/service/BcryptPasswordHasher';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { CodigoVerificacion } from '../../../src/domain/entity/CodigoVerificacion';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { CodigoInvalidoException } from '../../../src/application/exception/CodigoInvalidoException';
import { CodigoExpiradoException } from '../../../src/application/exception/CodigoExpiradoException';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

describe('RecuperarContrasenaUseCase Integration Tests', () => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const codigoRepository = new PrismaCodigoVerificacionRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const useCase = new RecuperarContrasenaUseCase(
    codigoRepository,
    usuarioRepository,
    passwordHasher
  );

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

  const seedUsuarioYCodigo = async (
    correo: string,
    codigo: string,
    initialPasswordPlain: string,
    fechaExpiracion: Date = new Date(Date.now() + 15 * 60 * 1000)
  ) => {
    const hashed = await passwordHasher.hashearContrasena(initialPasswordPlain);
    const usuario = new Usuario(
      0,
      hashed,
      'Recovery',
      'User',
      correo,
      '76543210',
      '922110099',
      Genero.MASCULINO,
      new Date('1991-03-25'),
      Rol.PACIENTE,
      true
    );
    const savedUser = await usuarioRepository.save(usuario);
    await codigoRepository.save(new CodigoVerificacion(0, correo, codigo, fechaExpiracion));
    return savedUser;
  };

  it('debe actualizar la contraseña hasheada en la BD y eliminar el código utilizado', async () => {
    const correo = 'reset_pass@test.com';
    const codigo = '654321';
    const oldPassword = 'OldPassword123!';
    const newPassword = 'NewSuperPassword456!';

    const user = await seedUsuarioYCodigo(correo, codigo, oldPassword);

    await useCase.ejecutar({
      correo,
      codigo,
      nuevaContrasena: newPassword,
    });

    // Check user has new hashed password in DB
    const userDb = await usuarioRepository.findById(user.idUsuario);
    expect(userDb).not.toBeNull();

    const oldMatches = await passwordHasher.compararContrasena(oldPassword, userDb!.contrasena);
    expect(oldMatches).toBe(false);

    const newMatches = await passwordHasher.compararContrasena(newPassword, userDb!.contrasena);
    expect(newMatches).toBe(true);

    // Code must be deleted from DB
    const codigoDb = await codigoRepository.findByCorreoYCodigo(correo, codigo);
    expect(codigoDb).toBeNull();
  });

  it('debe lanzar CodigoInvalidoException si el código no coincide', async () => {
    const correo = 'wrong_reset_code@test.com';
    await seedUsuarioYCodigo(correo, '123456', 'Password123!');

    await expect(
      useCase.ejecutar({
        correo,
        codigo: '999999',
        nuevaContrasena: 'NewPassword!',
      })
    ).rejects.toThrow(CodigoInvalidoException);
  });

  it('debe lanzar CodigoExpiradoException si el código ya expiró', async () => {
    const correo = 'expired_reset_code@test.com';
    const expirado = new Date(Date.now() - 5 * 60 * 1000);
    await seedUsuarioYCodigo(correo, '123456', 'Password123!', expirado);

    await expect(
      useCase.ejecutar({
        correo,
        codigo: '123456',
        nuevaContrasena: 'NewPassword!',
      })
    ).rejects.toThrow(CodigoExpiradoException);
  });
});
