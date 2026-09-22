"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegisterUseCase_1 = require("../../../../src/application/usecases/Authentication/RegisterUseCase");
const CorreoRegistradoException_1 = require("../../../../src/application/exception/CorreoRegistradoException");
const Usuario_1 = require("../../../../src/domain/entity/Usuario");
const Paciente_1 = require("../../../../src/domain/entity/Paciente");
describe('RegisterUseCase', () => {
    let registerUseCase;
    let mockUsuarioRepository;
    let mockPacienteRepository;
    let mockBcryptHasher;
    let mockTransactionManager;
    let correoRegistradoException;
    beforeEach(() => {
        mockUsuarioRepository = {
            existsByEmail: jest.fn(),
            create: jest.fn(),
        };
        mockPacienteRepository = {
            create: jest.fn(),
        };
        mockBcryptHasher = {
            encriptarContrasena: jest.fn(),
        };
        mockTransactionManager = {
            withTransaction: jest.fn(),
        };
        correoRegistradoException = new CorreoRegistradoException_1.CorreoRegistradoException();
        mockTransactionManager.withTransaction.mockImplementation(async (fn) => {
            const mockConnection = {};
            return await fn(mockConnection);
        });
        registerUseCase = new RegisterUseCase_1.RegisterUseCase({
            usuarioRepository: mockUsuarioRepository,
            pacienteRepository: mockPacienteRepository,
            bcryptHasher: mockBcryptHasher,
            transactionManager: mockTransactionManager,
            correoRegistradoException,
        });
    });
    it('debe registrar un nuevo paciente correctamente', async () => {
        const nuevoPaciente = {
            correo: 'test@mail.com',
            contrasena: 'password',
            nombres: 'Juan',
            apellidos: 'Perez',
            telefono: '999999999',
            fecha_nacimiento: '1990-01-01',
            genero: 'Masculino',
        };
        mockUsuarioRepository.existsByEmail.mockResolvedValue(false);
        mockBcryptHasher.encriptarContrasena.mockResolvedValue('hashed');
        mockUsuarioRepository.create.mockResolvedValue(10);
        mockPacienteRepository.create.mockResolvedValue(5);
        const result = await registerUseCase.execute(nuevoPaciente);
        expect(mockUsuarioRepository.existsByEmail).toHaveBeenCalledWith('test@mail.com', expect.any(Object));
        expect(mockBcryptHasher.encriptarContrasena).toHaveBeenCalledWith('password');
        expect(mockUsuarioRepository.create).toHaveBeenCalledWith(expect.any(Usuario_1.Usuario), expect.any(Object));
        expect(mockPacienteRepository.create).toHaveBeenCalledWith(expect.any(Paciente_1.Paciente), expect.any(Object));
        expect(result.idUsuario).toBe(10);
    });
    it('debe lanzar CorreoRegistradoException si el correo ya existe', async () => {
        const nuevoPaciente = {
            correo: 'test@mail.com',
            contrasena: 'password',
            nombres: 'Juan',
            apellidos: 'Perez',
            telefono: '999999999',
            fecha_nacimiento: '1990-01-01',
            genero: 'Masculino',
        };
        mockUsuarioRepository.existsByEmail.mockResolvedValue(true);
        await expect(registerUseCase.execute(nuevoPaciente)).rejects.toThrow(CorreoRegistradoException_1.CorreoRegistradoException);
        expect(mockBcryptHasher.encriptarContrasena).not.toHaveBeenCalled();
    });
});
