import { CodigoVerificacion } from '../entity/CodigoVerificacion';

export interface ICodigoVerificacionRepository {
  create(codigoVerificacion: CodigoVerificacion, connection?: any): Promise<number>;
  findByCorreo(correo: string, connection?: any): Promise<CodigoVerificacion | null>;
  deleteByCorreo(correo: string, connection?: any): Promise<void>;
}
