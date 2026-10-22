import { Request, Response } from 'express';
import { AuthController } from '../../../../../src/presenter/rest/controller/AuthController';
import { RegistrarseUseCase } from '../../../../../src/application/usecase/auth/RegistrarseUseCase';
import { VerificarCodigoUseCase } from '../../../../../src/application/usecase/auth/VerificarCodigoUseCase';
import { IniciarSesionUseCase } from '../../../../../src/application/usecase/auth/IniciarSesionUseCase';
import { ReenviarCodigoUseCase } from '../../../../../src/application/usecase/auth/ReenviarCodigoUseCase';
import { SolicitarRecuperacionUseCase } from '../../../../../src/application/usecase/auth/SolicitarRecuperacionUseCase';
import { RecuperarContrasenaUseCase } from '../../../../../src/application/usecase/auth/RecuperarContrasenaUseCase';
import { RefrescarTokenUseCase } from '../../../../../src/application/usecase/auth/RefrescarTokenUseCase';
import { RefreshTokenRepository } from '../../../../../src/domain/repository/RefreshTokenRepository';
import { Rol } from '../../../../../src/domain/enum/Rol';
import { Genero } from '../../../../../src/domain/enum/Genero';

import { CredencialesIncorrectasException } from '../../../../../src/application/exception/CredencialesIncorrectasException';
import { CorreoNoVerificadoException } from '../../../../../src/application/exception/CorreoNoVerificadoException';
import { UsuarioYaExisteException } from '../../../../../src/application/exception/UsuarioYaExisteException';
import { EmailNoEnviadoException } from '../../../../../src/application/exception/EmailNoEnviadoException';
import { CodigoInvalidoException } from '../../../../../src/application/exception/CodigoInvalidoException';
import { UsuarioNoEncontradoException } from '../../../../../src/application/exception/UsuarioNoEncontradoException';
import { TokenInvalidoException } from '../../../../../src/application/exception/TokenInvalidoException';

describe('AuthController Unit Tests', () => {
  let registrarseUseCase: jest.Mocked<RegistrarseUseCase>;
  let verificarCodigoUseCase: jest.Mocked<VerificarCodigoUseCase>;
  let iniciarSesionUseCase: jest.Mocked<IniciarSesionUseCase>;
  let reenviarCodigoUseCase: jest.Mocked<ReenviarCodigoUseCase>;
  let solicitarRecuperacionUseCase: jest.Mocked<SolicitarRecuperacionUseCase>;
  let recuperarContrasenaUseCase: jest.Mocked<RecuperarContrasenaUseCase>;
  let refrescarTokenUseCase: jest.Mocked<RefrescarTokenUseCase>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let controller: AuthController;

  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    registrarseUseCase = { ejecutar: jest.fn() } as any;
    verificarCodigoUseCase = { ejecutar: jest.fn() } as any;
    iniciarSesionUseCase = { ejecutar: jest.fn() } as any;
    reenviarCodigoUseCase = { ejecutar: jest.fn() } as any;
    solicitarRecuperacionUseCase = { ejecutar: jest.fn() } as any;
    recuperarContrasenaUseCase = { ejecutar: jest.fn() } as any;
    refrescarTokenUseCase = { ejecutar: jest.fn() } as any;
    refreshTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      revokeByToken: jest.fn(),
      revokeAllByUsuario: jest.fn(),
      deleteByToken: jest.fn(),
    };

    controller = new AuthController(
      registrarseUseCase,
      verificarCodigoUseCase,
      iniciarSesionUseCase,
      reenviarCodigoUseCase,
      solicitarRecuperacionUseCase,
      recuperarContrasenaUseCase,
      refrescarTokenUseCase,
      refreshTokenRepository
    );

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
  });

  describe('registrarse', () => {
    it('debe registrar exitosamente un usuario y retornar 201', async () => {
      mockReq = {
        body: {
          nombres: 'Ana',
          apellidos: 'Torres',
          correo: 'ana@test.com',
          contrasena: 'Pass123!',
          documento_identidad: '12345678',
          telefono: '999888777',
          genero: Genero.FEMENINO,
          fecha_nacimiento: '1995-05-10',
          rol: Rol.PACIENTE,
        },
      };

      registrarseUseCase.ejecutar.mockResolvedValue(undefined);

      await controller.registrarse(mockReq as Request, mockRes as Response);

      expect(registrarseUseCase.ejecutar).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Usuario registrado exitosamente'),
        })
      );
    });

    it('debe retornar 400 si faltan campos obligatorios', async () => {
      mockReq = {
        body: {
          nombres: 'Ana',
        },
      };

      await controller.registrarse(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(registrarseUseCase.ejecutar).not.toHaveBeenCalled();
    });

    it('debe retornar 409 si el usuario ya existe', async () => {
      mockReq = {
        body: {
          nombres: 'Ana',
          apellidos: 'Torres',
          correo: 'existente@test.com',
          contrasena: 'Pass123!',
          rol: Rol.PACIENTE,
        },
      };

      registrarseUseCase.ejecutar.mockRejectedValue(new UsuarioYaExisteException());

      await controller.registrarse(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('debe retornar 502 si no se pudo enviar el correo de verificación', async () => {
      mockReq = {
        body: {
          nombres: 'Ana',
          apellidos: 'Torres',
          correo: 'ana@test.com',
          contrasena: 'Pass123!',
          rol: Rol.PACIENTE,
        },
      };

      registrarseUseCase.ejecutar.mockRejectedValue(new EmailNoEnviadoException());

      await controller.registrarse(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(502);
    });
  });

  describe('iniciarSesion', () => {
    it('debe autenticar al usuario, establecer las cookies de access y refresh token y retornar 200', async () => {
      mockReq = {
        body: {
          correo: 'ana@test.com',
          contrasena: 'Pass123!',
        },
      };

      const fakeTokens = {
        accessToken: 'access.jwt.token',
        refreshToken: 'refresh.jwt.token',
      };
      iniciarSesionUseCase.ejecutar.mockResolvedValue(fakeTokens);

      await controller.iniciarSesion(mockReq as Request, mockRes as Response);

      expect(iniciarSesionUseCase.ejecutar).toHaveBeenCalledWith({
        correo: 'ana@test.com',
        contrasena: 'Pass123!',
      });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        fakeTokens.accessToken,
        expect.objectContaining({
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
        })
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        fakeTokens.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          path: '/api/v1/auth',
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Inicio de sesión exitoso',
        accessToken: fakeTokens.accessToken,
      });
    });

    it('debe retornar 400 si faltan correo o contraseña', async () => {
      mockReq = { body: { correo: 'ana@test.com' } };

      await controller.iniciarSesion(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('debe retornar 401 si las credenciales son incorrectas', async () => {
      mockReq = { body: { correo: 'ana@test.com', contrasena: 'wrong' } };
      iniciarSesionUseCase.ejecutar.mockRejectedValue(new CredencialesIncorrectasException());

      await controller.iniciarSesion(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('debe retornar 403 si el correo no ha sido verificado', async () => {
      mockReq = { body: { correo: 'ana@test.com', contrasena: 'pass' } };
      iniciarSesionUseCase.ejecutar.mockRejectedValue(new CorreoNoVerificadoException());

      await controller.iniciarSesion(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('refrescarToken', () => {
    it('debe renovar exitosamente los tokens y actualizar las cookies', async () => {
      mockReq = {
        cookies: {
          refresh_token: 'valid.refresh.token',
        },
      };

      const newTokens = {
        accessToken: 'new.access.token',
        refreshToken: 'new.refresh.token',
      };
      refrescarTokenUseCase.ejecutar.mockResolvedValue(newTokens);

      await controller.refrescarToken(mockReq as Request, mockRes as Response);

      expect(refrescarTokenUseCase.ejecutar).toHaveBeenCalledWith('valid.refresh.token');
      expect(mockRes.cookie).toHaveBeenCalledWith('access_token', newTokens.accessToken, expect.any(Object));
      expect(mockRes.cookie).toHaveBeenCalledWith('refresh_token', newTokens.refreshToken, expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debe retornar 401 NO_REFRESH_TOKEN si no existe cookie refresh_token', async () => {
      mockReq = { cookies: {} };

      await controller.refrescarToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NO_REFRESH_TOKEN' })
      );
    });

    it('debe retornar 401 INVALID_REFRESH_TOKEN si el token es inválido o expiró', async () => {
      mockReq = { cookies: { refresh_token: 'expired.token' } };
      refrescarTokenUseCase.ejecutar.mockRejectedValue(new TokenInvalidoException());

      await controller.refrescarToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'INVALID_REFRESH_TOKEN' })
      );
    });
  });

  describe('verificarCodigo', () => {
    it('debe retornar 200 al verificar exitosamente', async () => {
      mockReq = { body: { correo: 'ana@test.com', codigo: '123456' } };
      verificarCodigoUseCase.ejecutar.mockResolvedValue(undefined);

      await controller.verificarCodigo(mockReq as Request, mockRes as Response);

      expect(verificarCodigoUseCase.ejecutar).toHaveBeenCalledWith({
        correo: 'ana@test.com',
        codigo: '123456',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debe retornar 400 si el código es inválido', async () => {
      mockReq = { body: { correo: 'ana@test.com', codigo: 'wrong' } };
      verificarCodigoUseCase.ejecutar.mockRejectedValue(new CodigoInvalidoException());

      await controller.verificarCodigo(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('reenviarCodigo', () => {
    it('debe reenviar código y retornar 200', async () => {
      mockReq = { body: { correo: 'ana@test.com' } };
      reenviarCodigoUseCase.ejecutar.mockResolvedValue(undefined);

      await controller.reenviarCodigo(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debe retornar 404 si el usuario no existe', async () => {
      mockReq = { body: { correo: 'noexiste@test.com' } };
      reenviarCodigoUseCase.ejecutar.mockRejectedValue(new UsuarioNoEncontradoException());

      await controller.reenviarCodigo(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('debe retornar 502 si no se pudo enviar el correo', async () => {
      mockReq = { body: { correo: 'ana@test.com' } };
      reenviarCodigoUseCase.ejecutar.mockRejectedValue(new EmailNoEnviadoException());

      await controller.reenviarCodigo(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(502);
    });
  });

  describe('solicitarRecuperacion', () => {
    it('debe solicitar recuperación y retornar 200', async () => {
      mockReq = { body: { correo: 'ana@test.com' } };
      solicitarRecuperacionUseCase.ejecutar.mockResolvedValue(undefined);

      await controller.solicitarRecuperacion(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('recuperarContrasena', () => {
    it('debe restablecer contraseña y retornar 200', async () => {
      mockReq = {
        body: {
          correo: 'ana@test.com',
          codigo: '123456',
          nuevaContrasena: 'NewPass123!',
        },
      };
      recuperarContrasenaUseCase.ejecutar.mockResolvedValue(undefined);

      await controller.recuperarContrasena(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('cerrarSesion', () => {
    it('debe revocar el token en BD, limpiar las cookies y retornar 200', async () => {
      mockReq = { cookies: { refresh_token: 'token.to.revoke' } };

      await controller.cerrarSesion(mockReq as Request, mockRes as Response);

      expect(refreshTokenRepository.revokeByToken).toHaveBeenCalledWith('token.to.revoke');
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true })
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ httpOnly: true, path: '/api/v1/auth' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
