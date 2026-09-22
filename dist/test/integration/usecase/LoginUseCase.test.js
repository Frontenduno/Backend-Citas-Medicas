"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoginUseCase_1 = require("../../../src/application/usecases/Authentication/LoginUseCase");
const UserRepositoryMySQL_1 = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");
const BcryptHasherImpl_1 = require("../../../src/infrastructure/service/BcryptHasherImpl");
const JwtGeneratorImpl_1 = require("../../../src/infrastructure/service/JwtGeneratorImpl");
const CredencialesIncorrectasException_1 = require("../../../src/application/exception/CredencialesIncorrectasException");
const Usuario_1 = require("../../../src/domain/entity/Usuario");
const PoolConexion_1 = require("../../../src/infrastructure/database/PoolConexion");
describe('LoginUseCase (Integration)', () => {
    afterAll(async () => {
        await (0, PoolConexion_1.closeConnection)();
    });
    test('debe autenticar un usuario registrado', async () => {
        const usuarioRepository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
        const bcryptHasher = new BcryptHasherImpl_1.BcryptHasherImpl();
        const jwtGenerator = new JwtGeneratorImpl_1.JwtGeneratorImpl();
        const loginUseCase = new LoginUseCase_1.LoginUseCase({
            usuarioRepository,
            bcryptHasher,
            jwtGenerator,
            credencialesIncorrectasException: new CredencialesIncorrectasException_1.CredencialesIncorrectasException(),
        });
        const email = `login_${Date.now()}@example.com`;
        const contrasena = 'secreta123';
        const hashedPassword = await bcryptHasher.encriptarContrasena(contrasena);
        await usuarioRepository.create(new Usuario_1.Usuario(null, hashedPassword, 'Juan', 'Perez', email, '987654321', '1990-01-01', 'Masculino', 'PACIENTE'));
        const result = await loginUseCase.execute(email, contrasena);
        expect(result.token).toBeDefined();
        expect(result.usuario.correo).toBe(email);
    });
});
