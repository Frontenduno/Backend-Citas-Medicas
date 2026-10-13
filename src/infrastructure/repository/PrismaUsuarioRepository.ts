import { UsuarioRepository } from '../../domain/repository/UsuarioRepository';
import { Usuario } from '../../domain/entity/Usuario';
import { prisma } from '../database/prisma';
import { UsuarioMapper } from '../mappers/UsuarioMapper';

export class PrismaUsuarioRepository implements UsuarioRepository {
  async save(usuario: Usuario): Promise<Usuario> {
    const data = UsuarioMapper.toPrisma(usuario);
    const created = await prisma.usuario.create({ data });
    return UsuarioMapper.toDomain(created);
  }

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const updated = await prisma.usuario.update({
      where: { idUsuario: id },
      data: {
        ...(usuario.nombres && { nombres: usuario.nombres }),
        ...(usuario.apellidos && { apellidos: usuario.apellidos }),
        ...(usuario.correo && { correo: usuario.correo }),
        ...(usuario.telefono && { telefono: usuario.telefono }),
        ...(usuario.documento_identidad && { documento_identidad: usuario.documento_identidad }),
        ...(usuario.genero && { genero: usuario.genero }),
        ...(usuario.fecha_nacimiento && { fecha_nacimiento: usuario.fecha_nacimiento }),
        ...(usuario.rol && { rol: usuario.rol }),
        ...(usuario.verificado !== undefined && { verificado: usuario.verificado }),
        ...(usuario.contrasena && { contrasena: usuario.contrasena }),

      },
    });
    return UsuarioMapper.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await prisma.usuario.delete({ where: { idUsuario: id } });
  }

  async findById(id: number): Promise<Usuario | null> {
    const record = await prisma.usuario.findUnique({ where: { idUsuario: id } });
    if (!record) return null;
    return UsuarioMapper.toDomain(record);
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    const record = await prisma.usuario.findUnique({ where: { correo } });
    if (!record) return null;
    return UsuarioMapper.toDomain(record);
  }

  async findByDocumento(documento: string): Promise<Usuario | null> {
    const record = await prisma.usuario.findUnique({ where: { documento_identidad: documento } });
    if (!record) return null;
    return UsuarioMapper.toDomain(record);
  }

  async findAll(): Promise<Usuario[]> {
    const records = await prisma.usuario.findMany();
    return records.map(UsuarioMapper.toDomain);
  }
}
