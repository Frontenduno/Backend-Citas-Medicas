import { CodigoVerificacion as PrismaCodigo } from '@prisma/client';
import { CodigoVerificacion } from '../../domain/entity/CodigoVerificacion';

export class CodigoVerificacionMapper {
  static toDomain(prismaCodigo: PrismaCodigo): CodigoVerificacion {
    return new CodigoVerificacion(
      prismaCodigo.idCodigoVerificacion,
      prismaCodigo.correo,
      prismaCodigo.codigo,
      prismaCodigo.fecha_expiracion,
      prismaCodigo.created_at
    );
  }

  static toPrisma(codigo: CodigoVerificacion) {
    return {
      correo: codigo.correo,
      codigo: codigo.codigo,
      fecha_expiracion: codigo.fecha_expiracion,
    };
  }
}
