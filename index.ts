import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createCompositionRoot } from "./CompositionRoot";
import { requestIdMiddleware } from "./src/presenter/middleware/requestId";
import { pool } from "./src/infrastructure/database/PoolConexion";

dotenv.config();

const app = express();
const { 
  authRoutes, 
  pacienteRoutes, 
  verificationRoutes,
  healthRoutes,
  purgarVerificacionesJob,
  logger,
  errorHandler
} = createCompositionRoot();

// Iniciar Jobs
purgarVerificacionesJob.start();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestIdMiddleware);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/paciente", pacienteRoutes);
app.use("/api/verificacion", verificationRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  logger.info(`Example app listening at http://localhost:${port}`);
});

// Graceful Shutdown
function gracefulShutdown(signal: string) {
  logger.info(`Se recibió la señal ${signal}. Cerrando servidor...`);
  
  server.close(async () => {
    logger.info('Servidor HTTP cerrado.');
    
    try {
      purgarVerificacionesJob.stop();
      await pool.end();
      logger.info('Pool de conexiones MySQL cerrado.');
      process.exit(0);
    } catch (err) {
      logger.error('Error al cerrar recursos', err as Error);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app };

