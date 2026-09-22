"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurgarVerificacionesJob = void 0;
const cron = __importStar(require("node-cron"));
class PurgarVerificacionesJob {
    constructor(codigoRepo, logger) {
        this.codigoRepo = codigoRepo;
        this.logger = logger;
        this.task = null;
    }
    start() {
        this.logger.info('Registrando cron job: PurgarVerificacionesJob (0 3 * * *)');
        // Se ejecuta a las 3:00 AM todos los días
        this.task = cron.schedule('0 3 * * *', async () => {
            this.logger.info('Ejecutando limpieza de verificaciones antiguas...');
            try {
                const purgados = await this.codigoRepo.purgarAntiguas(30);
                this.logger.info(`Limpieza completada. Registros eliminados: ${purgados}`);
            }
            catch (error) {
                this.logger.error('Error al purgar verificaciones antiguas', error);
            }
        });
    }
    stop() {
        if (this.task) {
            this.task.stop();
            this.logger.info('Cron job detenido: PurgarVerificacionesJob');
        }
    }
}
exports.PurgarVerificacionesJob = PurgarVerificacionesJob;
