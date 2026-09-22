"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoginUseCase_1 = require("../../../../src/application/usecases/Authentication/LoginUseCase");
const CredencialesIncorrectasException_1 = require("../../../../src/application/exception/CredencialesIncorrectasException");
describe('LoginUseCase', () => {
    let loginUseCase;
    let mockUsuarioRepository;
    let mockBcryptHasher;
    let mockJwtGenerator;
    let credencialesIncorrectasException;
    beforeEach(() => {
        mockUsuarioRepository = {
            findByEmail: jest.fn(),
        };
        mockBcryptHasher = {
            compararContrasenas: jest.fn(),
        };
        mockJwtGenerator = {
            firmarCredenciales: jest.fn(),
        };
        credencialesIncorrectasException = new CredencialesIncorrectasException_1.CredencialesIncorrectasException();
        loginUseCase = new LoginUseCase_1.LoginUseCase({
            usuarioRepository: mockUsuarioRepository,
            bcryptHasher: mockBcryptHasher,
            jwtGenerator: mockJwtGenerator,
            credencialesIncorrectasException,
        });
    });
    it('debe autenticar un usuario correctamente', async () => {
        const mockUsuario = {
            idUsuario: 1,
            correo: 'test@mail.com',
            contrasena: 'hashed',
            rol: 'PACIENTE',
            nombres: 'Juan',
            apellidos: 'Perez',
            telefono: '999999999',
            fecha_nacimiento: '1990-01-01',
            genero: 'Masculino',
        };
        mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
        mockBcryptHasher.compararContrasenas.mockResolvedValue(true);
        mockJwtGenerator.firmarCredenciales.mockReturnValue('token123');
        const result = await loginUseCase.execute('test@mail.com', 'password');
        expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith('test@mail.com');
        expect(mockBcryptHasher.compararContrasenas).toHaveBeenCalledWith('password', 'hashed');
        expect(mockJwtGenerator.firmarCredenciales).toHaveBeenCalledWith({
            id: 1,
            correo: 'test@mail.com',
            rol: 'PACIENTE',
        });
        expect(result).toEqual({
            token: 'token123',
            usuario: {
                idUsuario: 1,
                nombres: 'Juan',
                apellidos: 'Perez',
                correo: 'test@mail.com',
                rol: 'PACIENTE',
            },
        });
    });
    it('debe lanzar CredencialesIncorrectasException si el usuario no existe', async () => {
        mockUsuarioRepository.findByEmail.mockResolvedValue(null);
        await expect(loginUseCase.execute('test@mail.com', 'password')).rejects.toThrow(CredencialesIncorrectasException_1.CredencialesIncorrectasException);
        expect(mockBcryptHasher.compararContrasenas).not.toHaveBeenCalled();
    });
    it('debe lanzar CredencialesIncorrectasException si la contrasena es incorrecta', async () => {
        const mockUsuario = {
            idUsuario: 1,
            correo: 'test@mail.com',
            contrasena: 'hashed',
            rol: 'PACIENTE',
            nombres: 'Juan',
            apellidos: 'Perez',
            telefono: '999999999',
            fecha_nacimiento: '1990-01-01',
            genero: 'Masculino',
        };
        mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
        mockBcryptHasher.compararContrasenas.mockResolvedValue(false);
        await expect(loginUseCase.execute('test@mail.com', 'wrong')).rejects.toThrow(CredencialesIncorrectasException_1.CredencialesIncorrectasException);
        expect(mockJwtGenerator.firmarCredenciales).not.toHaveBeenCalled();
    });
});
