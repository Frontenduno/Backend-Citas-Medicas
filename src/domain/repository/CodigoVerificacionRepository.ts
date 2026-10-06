import { CodigoVerificacion } from '../entity/CodigoVerificacion';

export interface CodigoVerificacionRepository {
  save(codigo: CodigoVerificacion): Promise<CodigoVerificacion>;
  findByCorreoYCodigo(correo: string, codigo: string): Promise<CodigoVerificacion | null>;
  deleteByCorreo(correo: string): Promise<void>;
}
