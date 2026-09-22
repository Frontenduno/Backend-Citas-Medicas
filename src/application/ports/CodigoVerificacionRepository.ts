import { CodigoVerificacion, TipoVerificacion } from '../../domain/entity/CodigoVerificacion';

export interface CodigoVerificacionRepository {
  invalidarPendientes(usuarioId: number, tipo: TipoVerificacion, connection?: any): Promise<void>;
  crear(codigo: CodigoVerificacion, connection?: any): Promise<CodigoVerificacion>;
  buscarUltimoPendiente(usuarioId: number, tipo: TipoVerificacion, connection?: any): Promise<CodigoVerificacion | null>;
  actualizar(codigo: CodigoVerificacion, connection?: any): Promise<void>;
  contarRecientes(usuarioId: number, tipo: TipoVerificacion, segundos: number, connection?: any): Promise<number>;
  contarPorIp(ip: string, segundos: number, connection?: any): Promise<number>;
  purgarAntiguas(dias: number, connection?: any): Promise<number>;
}

