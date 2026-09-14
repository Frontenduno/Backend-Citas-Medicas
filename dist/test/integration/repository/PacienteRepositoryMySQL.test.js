"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PacienteRepositoryMySQL_1 = require("../../../src/infrastructure/repositories/PacienteRepositoryMySQL");
const Paciente_1 = require("../../../src/domain/entity/Paciente");
const UserRepositoryMySQL_1 = require("../../../src/infrastructure/repositories/UserRepositoryMySQL");
const Usuario_1 = require("../../../src/domain/entity/Usuario");
const PoolConexion_1 = require("../../../src/infrastructure/database/PoolConexion");
describe('PacienteRepositoryMySQL', () => {
    afterAll(async () => {
        await (0, PoolConexion_1.closeConnection)();
    });
    test('Debe registrar paciente', async () => {
        const pacienteRepository = new PacienteRepositoryMySQL_1.PacienteRepositoryMySQL();
        const usuarioRepository = new UserRepositoryMySQL_1.UsuarioRepositoryMySQL();
        const email = `testing_${Date.now()}@test.com`;
        const usuario = new Usuario_1.Usuario(null, 'password123', 'Usuario', 'Rollback', email, '999999999', '1990-01-01', 'Masculino', 'Paciente');
        const usuarioId = await usuarioRepository.create(usuario);
        const paciente = new Paciente_1.Paciente(null, usuarioId);
        const pacienteId = await pacienteRepository.create(paciente);
        expect(pacienteId).toBeGreaterThan(0);
    });
});
