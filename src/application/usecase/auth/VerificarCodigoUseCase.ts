import { CodigoVerificacionRepository } from "../../../domain/repository/CodigoVerificacionRepository";
import { UsuarioRepository } from "../../../domain/repository/UsuarioRepository";
import { VerificarCodigoDTO } from "../../dto/AuthDTO";
import { CodigoExpiradoException } from "../../exception/CodigoExpiradoException";
import { CodigoInvalidoException } from "../../exception/CodigoInvalidoException";
import { UsuarioNoEncontradoException } from "../../exception/UsuarioNoEncontradoException";

export class VerificarCodigoUseCase {
    private readonly codigoVerificacionRepository: CodigoVerificacionRepository;
    private readonly usuarioRepository: UsuarioRepository;

    constructor(
        codigoVerificacionRepository: CodigoVerificacionRepository,
        usuarioRepository: UsuarioRepository
    ) {
        this.codigoVerificacionRepository = codigoVerificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    async ejecutar(data: VerificarCodigoDTO): Promise<void> {
        const codigoEntity = await this.codigoVerificacionRepository.findByCorreoYCodigo(
            data.correo,
            data.codigo
        );

        if (!codigoEntity) {
            throw new CodigoInvalidoException();
        }

        if (codigoEntity.fecha_expiracion < new Date()) {
            throw new CodigoExpiradoException();
        }

        const usuario = await this.usuarioRepository.findByCorreo(data.correo);
        if (!usuario) {
            throw new UsuarioNoEncontradoException();
        }

        await this.usuarioRepository.update(usuario.idUsuario, { verificado: true });

        await this.codigoVerificacionRepository.deleteByCorreo(data.correo);
    }
}
