import { Request, Response } from 'express';
import { RegistrarseUseCase } from '../../../application/usecase/auth/RegistrarseUseCase';
import { VerificarCodigoUseCase } from '../../../application/usecase/auth/VerificarCodigoUseCase';
import { IniciarSesionUseCase } from '../../../application/usecase/auth/IniciarSesionUseCase';
import { ReenviarCodigoUseCase } from '../../../application/usecase/auth/ReenviarCodigoUseCase';
import { SolicitarRecuperacionUseCase } from '../../../application/usecase/auth/SolicitarRecuperacionUseCase';
import { RecuperarContrasenaUseCase } from '../../../application/usecase/auth/RecuperarContrasenaUseCase';
import { RefrescarTokenUseCase } from '../../../application/usecase/auth/RefrescarTokenUseCase';
import { RefreshTokenRepository } from '../../../domain/repository/RefreshTokenRepository';
import { RegistrarseDTO } from '../../../application/dto/AuthDTO';

import { BaseException } from '../../../application/exception/BaseException';
import { CredencialesIncorrectasException } from '../../../application/exception/CredencialesIncorrectasException';
import { CorreoNoVerificadoException } from '../../../application/exception/CorreoNoVerificadoException';
import { UsuarioNoEncontradoException } from '../../../application/exception/UsuarioNoEncontradoException';
import { UsuarioYaExisteException } from '../../../application/exception/UsuarioYaExisteException';
import { UsuarioYaVerificadoException } from '../../../application/exception/UsuarioYaVerificadoException';
import { CodigoInvalidoException } from '../../../application/exception/CodigoInvalidoException';
import { CodigoExpiradoException } from '../../../application/exception/CodigoExpiradoException';
import { TokenInvalidoException } from '../../../application/exception/TokenInvalidoException';

export class AuthController {
  constructor(
    private readonly registrarseUseCase: RegistrarseUseCase,
    private readonly verificarCodigoUseCase: VerificarCodigoUseCase,
    private readonly iniciarSesionUseCase: IniciarSesionUseCase,
    private readonly reenviarCodigoUseCase: ReenviarCodigoUseCase,
    private readonly solicitarRecuperacionUseCase: SolicitarRecuperacionUseCase,
    private readonly recuperarContrasenaUseCase: RecuperarContrasenaUseCase,
    private readonly refrescarTokenUseCase?: RefrescarTokenUseCase,
    private readonly refreshTokenRepository?: RefreshTokenRepository
  ) {}

  registrarse = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        nombres,
        apellidos,
        correo,
        contrasena,
        documento_identidad,
        telefono,
        genero,
        fecha_nacimiento,
        rol,
      } = req.body;

      if (!nombres || !apellidos || !correo || !contrasena || !rol) {
        return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados' });
      }

      const dto: RegistrarseDTO = {
        nombres,
        apellidos,
        correo,
        contrasena,
        documento_identidad,
        telefono,
        genero,
        fecha_nacimiento: new Date(fecha_nacimiento),
        rol,
      };

      await this.registrarseUseCase.ejecutar(dto);

      return res.status(201).json({
        message: 'Usuario registrado exitosamente. Se ha enviado un código de verificación a su correo.',
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  verificarCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { correo, codigo } = req.body;

      if (!correo || !codigo) {
        return res.status(400).json({ message: 'El correo y el código son requeridos' });
      }

      await this.verificarCodigoUseCase.ejecutar({ correo, codigo });

      return res.status(200).json({
        message: 'Cuenta verificada exitosamente. Ya puede iniciar sesión.',
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  iniciarSesion = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        return res.status(400).json({ message: 'El correo y la contraseña son requeridos' });
      }

      const tokens = await this.iniciarSesionUseCase.ejecutar({ correo, contrasena });

      // 1. Enviar el access_token como cookie HttpOnly (15 minutos)
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000,
      });

      // 2. Enviar el refresh_token como cookie HttpOnly (7 días, ruta acotada a auth)
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  refrescarToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({
          message: 'No se encontró el token de actualización (refresh_token)',
          code: 'NO_REFRESH_TOKEN',
        });
      }

      if (!this.refrescarTokenUseCase) {
        return res.status(500).json({ message: 'Servicio de refresco no disponible' });
      }

      const tokens = await this.refrescarTokenUseCase.ejecutar(refreshToken);

      // Renovar cookie de access_token
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000,
      });

      // Renovar cookie de refresh_token (Token Rotation)
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      return res.status(200).json({
        message: 'Token renovado exitosamente',
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  reenviarCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({ message: 'El correo es requerido' });
      }

      await this.reenviarCodigoUseCase.ejecutar({ correo });

      return res.status(200).json({
        message: 'Nuevo código de verificación enviado al correo.',
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  solicitarRecuperacion = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({ message: 'El correo es requerido' });
      }

      await this.solicitarRecuperacionUseCase.ejecutar({ correo });

      return res.status(200).json({
        message: 'Se ha enviado un código de recuperación a su correo electrónico.',
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  recuperarContrasena = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { correo, codigo, nuevaContrasena } = req.body;

      if (!correo || !codigo || !nuevaContrasena) {
        return res.status(400).json({
          message: 'El correo, el código y la nueva contraseña son requeridos',
        });
      }

      await this.recuperarContrasenaUseCase.ejecutar({
        correo,
        codigo,
        nuevaContrasena,
      });

      return res.status(200).json({
        message: 'Contraseña restablecida exitosamente. Puede iniciar sesión con su nueva contraseña.',
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  cerrarSesion = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken && this.refreshTokenRepository) {
      try {
        await this.refreshTokenRepository.revokeByToken(refreshToken);
      } catch (err) {
        console.error('Error al revocar refresh token:', err);
      }
    }

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/api/v1/auth',
    });

    return res.status(200).json({
      message: 'Sesión cerrada exitosamente',
    });
  };

  private handleError(error: unknown, res: Response): Response {
    if (error instanceof CredencialesIncorrectasException) {
      return res.status(401).json({ message: error.message });
    }
    if (error instanceof TokenInvalidoException) {
      return res.status(401).json({ message: error.message, code: 'INVALID_REFRESH_TOKEN' });
    }
    if (error instanceof CorreoNoVerificadoException) {
      return res.status(403).json({ message: error.message });
    }
    if (error instanceof UsuarioNoEncontradoException) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof UsuarioYaExisteException) {
      return res.status(409).json({ message: error.message });
    }
    if (
      error instanceof CodigoInvalidoException ||
      error instanceof CodigoExpiradoException ||
      error instanceof UsuarioYaVerificadoException ||
      error instanceof BaseException
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error('Error interno no controlado en AuthController:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
