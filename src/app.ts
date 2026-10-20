import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AuthFactory } from './infrastructure/di/factories/AuthFactory';
import { PacienteFactory } from './infrastructure/di/factories/PacienteFactory';
import { createAuthMiddleware } from './presenter/rest/middleware/AuthMiddleware';
import { SharedContainer } from './infrastructure/di/SharedContainer';

const app: Application = express();
const authRouter = AuthFactory.createRouter();
const pacienteRouter = PacienteFactory.createRouter();
const authMiddleware = createAuthMiddleware(SharedContainer.jwtGenerator);

// Configuración de Middlewares globales
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true, // Permite envío de cookies entre cliente y servidor
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de verificación de salud
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'backend-citas-medicas',
  });
});

// Rutas de la API
app.use('/api/v1/auth', authRouter);
app.use('/api/auth', authRouter); // Alias de compatibilidad
app.use('/api/v1/paciente', authMiddleware, pacienteRouter);

// Manejador para rutas no encontradas (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Manejador global de errores no capturados (500)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error no controlado en el servidor:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
  });
});

export default app;
export { app };
