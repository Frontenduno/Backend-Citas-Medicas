import { Request, Response, NextFunction } from 'express';
import { SolicitarCodigoUseCase } from '../../application/usecases/Verification/SolicitarCodigoUseCase';
import { ConfirmarCodigoUseCase } from '../../application/usecases/Verification/ConfirmarCodigoUseCase';

export interface VerificationControllerDependencies {
  solicitarCodigoUseCase: SolicitarCodigoUseCase;
  confirmarCodigoUseCase: ConfirmarCodigoUseCase;
}

export function createVerificationController(deps: VerificationControllerDependencies) {
  const { solicitarCodigoUseCase, confirmarCodigoUseCase } = deps;

  async function solicitar(req: Request, res: Response, next: NextFunction) {
    try {
      const { correo } = req.body;
      const ip = req.ip || req.connection.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      if (!correo) {
        return res.status(400).json({ error: 'El correo es requerido' });
      }

      await solicitarCodigoUseCase.execute({ correo, ip, userAgent });

      return res.status(200).json({
        success: true,
        mensaje: 'Código enviado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async function confirmar(req: Request, res: Response, next: NextFunction) {
    try {
      const { correo, codigo, contrasena, confirmarContrasena } = req.body;

      if (!correo || !codigo || !contrasena || !confirmarContrasena) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      await confirmarCodigoUseCase.execute({ correo, codigo, contrasena, confirmarContrasena });

      return res.status(200).json({
        success: true,
        mensaje: 'Correo verificado y contraseña actualizada correctamente',
      });
    } catch (error) {
      next(error);
    }
  }

  return { solicitar, confirmar };
}

