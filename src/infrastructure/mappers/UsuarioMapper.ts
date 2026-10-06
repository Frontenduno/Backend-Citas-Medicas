import { Usuario as PrismaUsuario } from '@prisma/client';
import { Usuario } from '../../domain/entity/Usuario';
import { Rol } from '../../domain/enum/Rol';
import { Genero } from '../../domain/enum/Genero';

export class UsuarioMapper {
  static toDomain(prismaUsuario: PrismaUsuario): Usuario {
    return new Usuario(
      prismaUsuario.idUsuario,
      prismaUsuario.contrasena,
      prismaUsuario.nombres,
      prismaUsuario.apellidos,
      prismaUsuario.correo,
      prismaUsuario.documento_identidad ?? '',
      prismaUsuario.telefono ?? '',
      prismaUsuario.genero as Genero,
      prismaUsuario.fecha_nacimiento,
      prismaUsuario.rol as Rol,
      prismaUsuario.verificado,
      prismaUsuario.created_at,
      prismaUsuario.updated_at
    );
  }

  static toPrisma(usuario: Usuario) {
    return {
      contrasena: usuario.contrasena,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      documento_identidad: usuario.documento_identidad || null,
      telefono: usuario.telefono || null,
      genero: usuario.genero,
      fecha_nacimiento: usuario.fecha_nacimiento,
      rol: usuario.rol,
      verificado: usuario.verificado,
    };
  }
}
