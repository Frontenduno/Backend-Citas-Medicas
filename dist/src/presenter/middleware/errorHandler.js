"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorHandler = createErrorHandler;
const AppException_1 = require("../../application/exception/AppException");
function createErrorHandler(logger) {
    return function errorHandler(err, req, res, next) {
        const requestId = req.headers['x-request-id'] || 'desconocido';
        if (err instanceof AppException_1.AppException) {
            logger.warn(`Error de aplicación: ${err.message}`, {
                requestId,
                code: err.code,
                status: err.httpStatus
            });
            return res.status(err.httpStatus).json({
                error: {
                    code: err.code,
                    message: err.message
                }
            });
        }
        logger.error(`Error interno no controlado`, err, { requestId });
        return res.status(500).json({
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Error interno del servidor'
            }
        });
    };
}
