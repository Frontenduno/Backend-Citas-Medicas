import dotenv from 'dotenv';
// Cargar variables de entorno desde .env
dotenv.config();

import app from './app';
import { SharedContainer } from './infrastructure/di/SharedContainer';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Endpoints de autenticación en http://localhost:${PORT}/api/v1/auth`);
  console.log(`🩺 Health check en http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Manejo de apagado limpio (Graceful Shutdown)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n[${signal}] Apagando servidor de forma limpia...`);
  server.close(async () => {
    console.log('Servidor HTTP cerrado.');
    try {
      await SharedContainer.prisma.$disconnect();
      console.log('Conexión con la base de datos cerrada.');
    } catch (error) {
      console.error('Error al cerrar la conexión con la base de datos:', error);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
