"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegisterUseCase_1 = require("../../../src/application/usecases/Authentication/RegisterUseCase");
const UserRepositoryMySQL_1 = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");
const PacienteRepositoryMySQL_1 = require("../../../src/infrastructure/repositories/PacienteRepositoryMySQL");
const BcryptHasherImpl_1 = require("../../../src/infrastructure/service/BcryptHasherImpl");
const TransactionManagerImpl_1 = require("../../../src/infrastructure/database/TransactionManagerImpl");
const CorreoRegistradoException_1 = require("../../../src/application/exception/CorreoRegistradoException");
const PoolConexion_1 = require("../../../src/infrastructure/database/PoolConexion");
describe('RegisterUseCase (Integration)', () => {
    afterAll(async () => {
        await (0, PoolConexion_1.closeConnection)();
    });
    test('debe registrar un nuevo paciente', async () => {
        const registerUseCase = new RegisterUseCase_1.RegisterUseCase({
            usuarioRepository: new UserRepositoryMySQL_1.UsuarioRepositoryMySQL(),
            pacienteRepository: new PacienteRepositoryMySQL_1.PacienteRepositoryMySQL(),
            bcryptHasher: new BcryptHasherImpl_1.BcryptHasherImpl(),
            transactionManager: new TransactionManagerImpl_1.TransactionManagerImpl(),
            correoRegistradoException: new CorreoRegistradoException_1.CorreoRegistradoException(),
        });
        const testUser = {
            correo: `juan.perez${Date.now()}@example.com`,
            contrasena: 'secreta123',
            nombres: 'Juan',
            apellidos: 'Perez',
            telefono: '987654321',
            fecha_nacimiento: '1990-01-01',
            genero: 'Masculino',
        };
        const result = await registerUseCase.execute(testUser);
        expect(result.idUsuario).toBeGreaterThan(0);
    });
});
