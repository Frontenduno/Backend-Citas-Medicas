"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodigoVerificacion = void 0;
class CodigoVerificacion {
    constructor(idCodigo, usuarioId, tipo, codigoHash, estado, intentos, maxIntentos, expiraEn, ipSolicitud, userAgent, fechaCreacion, fechaUso) {
        this.idCodigo = idCodigo ?? undefined;
        this.usuarioId = usuarioId;
        this.tipo = tipo;
        this.codigoHash = codigoHash;
        this.estado = estado;
        this.intentos = intentos;
        this.maxIntentos = maxIntentos;
        this.expiraEn = expiraEn;
        this.ipSolicitud = ipSolicitud;
        this.userAgent = userAgent;
        this.fechaCreacion = fechaCreacion;
        this.fechaUso = fechaUso;
    }
    esUsable() {
        return this.estado === 'PENDIENTE' && !this.estaExpirado() && this.intentos < this.maxIntentos;
    }
    estaExpirado() {
        return new Date() > this.expiraEn;
    }
    intentosRestantes() {
        return Math.max(0, this.maxIntentos - this.intentos);
    }
}
exports.CodigoVerificacion = CodigoVerificacion;
