import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import citaRoutes from './routes/citaRoutes';

export function createApp(): Application {
  const app: Application = express();

  // Middlewares
  app.use(express.json());
  app.use(morgan('dev'));

  // Health check / Root route
  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'API Citas Médicas - Clean Architecture v2.0.0 (TypeScript)' });
  });

  // Rutas principales
  app.use('/api/citas', citaRoutes);

  return app;
}

export default createApp();

