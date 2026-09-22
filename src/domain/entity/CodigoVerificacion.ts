export type EstadoCodigo = 'PENDIENTE' | 'USADO' | 'EXPIRADO' | 'BLOQUEADO';
export type TipoVerificacion = 'REGISTRO' | 'CAMBIO_CORREO' | 'RESET_PASSWORD' | '2FA';

export class CodigoVerificacion {
  readonly idCodigo?: number;
  readonly usuarioId: number;
  readonly tipo: TipoVerificacion;
  readonly codigoHash: string;
  readonly estado: EstadoCodigo;
  readonly intentos: number;
  readonly maxIntentos: number;
  readonly expiraEn: Date;
  readonly ipSolicitud: string | null;
  readonly userAgent: string | null;
  readonly fechaCreacion: Date;
  readonly fechaUso: Date | null;

  constructor(
    idCodigo: number | null,
    usuarioId: number,
    tipo: TipoVerificacion,
    codigoHash: string,
    estado: EstadoCodigo,
    intentos: number,
    maxIntentos: number,
    expiraEn: Date,
    ipSolicitud: string | null,
    userAgent: string | null,
    fechaCreacion: Date,
    fechaUso: Date | null
  ) {
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

  esUsable(): boolean {
    return this.estado === 'PENDIENTE' && !this.estaExpirado() && this.intentos < this.maxIntentos;
  }

  estaExpirado(): boolean {
    return new Date() > this.expiraEn;
  }

  intentosRestantes(): number {
    return Math.max(0, this.maxIntentos - this.intentos);
  }
}

