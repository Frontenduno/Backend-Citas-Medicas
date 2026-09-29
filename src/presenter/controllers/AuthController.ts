import { RegisterUseCase, NuevoPacienteRequest, RegisterUseCaseResult } from '../../application/usecases/Authentication/RegisterUseCase';
import { LoginUseCase, LoginUseCaseResult } from '../../application/usecases/Authentication/LoginUseCase';
import { VerificarCorreoUseCase, VerificarCorreoRequest } from '../../application/usecases/Authentication/VerificarCorreoUseCase';
import { Request, Response } from 'express';

export interface AuthControllerDependencies {
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
  verificarCorreoUseCase: VerificarCorreoUseCase;
}

export function createAuthController(deps: AuthControllerDependencies) {
  const { registerUseCase, loginUseCase, verificarCorreoUseCase } = deps;

  async function register(req: Request, res: Response) {
    try {
      const {
        correo,
        contrasena,
        nombres,
        apellidos,
        telefono,
        documento_identidad,
        fecha_nacimiento,
        genero,
      } = req.body;

      const pacienteData: NuevoPacienteRequest = {
        correo,
        contrasena,
        nombres,
        apellidos,
        telefono,
        documento_identidad,
        fecha_nacimiento,
        genero,
      };

      if (!pacienteData.correo || !pacienteData.contrasena || !pacienteData.fecha_nacimiento || !pacienteData.genero || !pacienteData.documento_identidad) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      const result: RegisterUseCaseResult = await registerUseCase.execute(pacienteData);

      return res.status(200).json({
        success: true,
        mensaje: result.mensaje,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      if (errorMessage === 'Este correo ya existe en esta plataforma...') {
        return res.status(409).json({ error: errorMessage });
      }
      console.log(req.body);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async function verificarCorreo(req: Request, res: Response) {
    try {
      const { correo, codigo } = req.body;

      if (!correo || !codigo) {
        return res.status(400).json({ error: 'Correo y código de verificación son requeridos' });
      }

      const request: VerificarCorreoRequest = { correo, codigo };
      const result = await verificarCorreoUseCase.execute(request);

      return res.status(200).json({
        success: true,
        mensaje: result.mensaje,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      if (errorMessage === 'El código de verificación es inválido o ha expirado') {
        return res.status(400).json({ error: errorMessage });
      }
      console.error('Error en verificación de correo:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async function login(req: Request, res: Response) {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
      }

      const result: LoginUseCaseResult = await loginUseCase.execute(correo, contrasena);

      res.cookie('token', result.token, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

      return res.status(200).json({
        usuario: result.usuario,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      if (errorMessage === 'Credenciales Incorrectas') {
        return res.status(401).json({ error: errorMessage });
      }
      if (errorMessage === 'Debe verificar su correo electrónico antes de iniciar sesión') {
        return res.status(403).json({ error: errorMessage });
      }
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return { register, verificarCorreo, login };
}
