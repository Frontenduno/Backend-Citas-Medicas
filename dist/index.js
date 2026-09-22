"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const CompositionRoot_1 = require("./CompositionRoot");
const requestId_1 = require("./src/presenter/middleware/requestId");
const PoolConexion_1 = require("./src/infrastructure/database/PoolConexion");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const { authRoutes, pacienteRoutes, verificationRoutes, healthRoutes, purgarVerificacionesJob, logger, errorHandler } = (0, CompositionRoot_1.createCompositionRoot)();
// Iniciar Jobs
purgarVerificacionesJob.start();
app.use((0, cors_1.default)({ origin: "http://localhost:3000", credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(requestId_1.requestIdMiddleware);
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
function gracefulShutdown(signal) {
    logger.info(`Se recibió la señal ${signal}. Cerrando servidor...`);
    server.close(async () => {
        logger.info('Servidor HTTP cerrado.');
        try {
            purgarVerificacionesJob.stop();
            await PoolConexion_1.pool.end();
            logger.info('Pool de conexiones MySQL cerrado.');
            process.exit(0);
        }
        catch (err) {
            logger.error('Error al cerrar recursos', err);
            process.exit(1);
        }
    });
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
