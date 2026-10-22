import { VerificarCodigoUseCase } from '../../../src/application/usecase/auth/VerificarCodigoUseCase';
import { PrismaUsuarioRepository } from '../../../src/infrastructure/repository/PrismaUsuarioRepository';
import { PrismaCodigoVerificacionRepository } from '../../../src/infrastructure/repository/PrismaCodigoVerificacionRepository';
import { PrismaTransactionManager } from '../../../src/infrastructure/database/PrismaTransactionManager';
import { CodigoVerificacionRepository } from '../../../src/domain/repository/CodigoVerificacionRepository';
import { Usuario } from '../../../src/domain/entity/Usuario';
import { CodigoVerificacion } from '../../../src/domain/entity/CodigoVerificacion';
import { Rol } from '../../../src/domain/enum/Rol';
import { Genero } from '../../../src/domain/enum/Genero';
import { CodigoInvalidoException } from '../../../src/application/exception/CodigoInvalidoException';
import { CodigoExpiradoException } from '../../../src/application/exception/CodigoExpiradoException';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';

class CodigoRepositoryQueFallaAlEliminar implements CodigoVerificacionRepository {
  constructor(private readonly real: CodigoVerificacionRepository) {}

  save(codigo: CodigoVerificacion) {
    return this.real.save(codigo);
  }

  findByCorreoYCodigo(correo: string, codigo: string) {
    return this.real.findByCorreoYCodigo(correo, codigo);
  }

  async deleteByCorreo(): Promise<void> {
    throw new Error('Fallo simulado al eliminar el código');
  }
}

describe('VerificarCodigoUseCase Integration Tests', () => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const codigoRepository = new PrismaCodigoVerificacionRepository();
  const transactionManager = new PrismaTransactionManager();
  const useCase = new VerificarCodigoUseCase(
    codigoRepository,
    usuarioRepository,
    transactionManager
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
    fechaExpiracion: Date = new Date(Date.now() + 15 * 60 * 1000)
  ) => {
    const usuario = new Usuario(
      0,
      'hashed_pwd',
      'Test',
      'User',
      correo,
      '87654321',
      '999888777',
      Genero.MASCULINO,
      new Date('1990-01-01'),
      Rol.PACIENTE,
      false
    );
    const savedUser = await usuarioRepository.save(usuario);
    const codigoObj = new CodigoVerificacion(0, correo, codigo, fechaExpiracion);
    await codigoRepository.save(codigoObj);
    return savedUser;
  };

  it('debe marcar al usuario como verificado y borrar el código de la BD tras una verificación exitosa', async () => {
    const correo = 'verify_ok@test.com';
    const codigo = '123456';
    const user = await seedUsuarioYCodigo(correo, codigo);

    await useCase.ejecutar({ correo, codigo });

    // Verify user is updated in database
    const userDb = await usuarioRepository.findById(user.idUsuario);
    expect(userDb?.verificado).toBe(true);

    // Verify verification code was cleaned from database
    const codigoDb = await codigoRepository.findByCorreoYCodigo(correo, codigo);
    expect(codigoDb).toBeNull();
  });

  it('debe lanzar CodigoInvalidoException si el código no coincide en la BD', async () => {
    const correo = 'wrong_code@test.com';
    await seedUsuarioYCodigo(correo, '654321');

    await expect(useCase.ejecutar({ correo, codigo: '999999' })).rejects.toThrow(
      CodigoInvalidoException
    );
  });

  it('debe lanzar CodigoExpiradoException si el código expiró', async () => {
    const correo = 'expired_code@test.com';
    const fechaExpirada = new Date(Date.now() - 1000 * 60); // 1 minute ago
    await seedUsuarioYCodigo(correo, '111222', fechaExpirada);

    await expect(useCase.ejecutar({ correo, codigo: '111222' })).rejects.toThrow(
      CodigoExpiradoException
    );
  });

  it('debe revertir la verificación del usuario si falla el borrado del código', async () => {
    const correo = 'verify_rollback@test.com';
    const codigo = '777888';
    const user = await seedUsuarioYCodigo(correo, codigo);

    const failingUseCase = new VerificarCodigoUseCase(
      new CodigoRepositoryQueFallaAlEliminar(codigoRepository),
      usuarioRepository,
      transactionManager
    );

    await expect(failingUseCase.ejecutar({ correo, codigo })).rejects.toThrow(
      'Fallo simulado al eliminar el código'
    );

    const userDb = await usuarioRepository.findById(user.idUsuario);
    expect(userDb?.verificado).toBe(false);
    expect(await codigoRepository.findByCorreoYCodigo(correo, codigo)).not.toBeNull();
  });
});
