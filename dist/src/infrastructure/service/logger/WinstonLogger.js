"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLogger = void 0;
const winston_1 = __importDefault(require("winston"));
class WinstonLogger {
    constructor() {
        this.logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            transports: [
                new winston_1.default.transports.Console()
            ]
        });
    }
    info(mensaje, meta) {
        this.logger.info(mensaje, meta);
    }
    warn(mensaje, meta) {
        this.logger.warn(mensaje, meta);
    }
    error(mensaje, error, meta) {
        this.logger.error(mensaje, {
            ...meta,
            errorName: error?.name,
            errorMessage: error?.message,
            stack: error?.stack
        });
    }
}
exports.WinstonLogger = WinstonLogger;
