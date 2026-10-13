import { CodigoVerificacionRepository } from "../../../domain/repository/CodigoVerificacionRepository";
import { UsuarioRepository } from "../../../domain/repository/UsuarioRepository";
import { RecuperarContrasenaDTO } from "../../dto/AuthDTO";
import { CodigoExpiradoException } from "../../exception/CodigoExpiradoException";
import { CodigoInvalidoException } from "../../exception/CodigoInvalidoException";
import { UsuarioNoEncontradoException } from "../../exception/UsuarioNoEncontradoException";
import { PasswordHasher } from "../../port/PasswordHasher";

export class RecuperarContrasenaUseCase {
    private readonly codigoVerificacionRepository: CodigoVerificacionRepository;
    private readonly usuarioRepository: UsuarioRepository;
    private readonly passwordHasher: PasswordHasher;

    constructor(
        codigoVerificacionRepository: CodigoVerificacionRepository,
        usuarioRepository: UsuarioRepository,
        passwordHasher: PasswordHasher
    ) {
        this.codigoVerificacionRepository = codigoVerificacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordHasher = passwordHasher;
    }

    async ejecutar(data: RecuperarContrasenaDTO): Promise<void> {
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

        const contrasenaHasheada = await this.passwordHasher.hashearContrasena(data.nuevaContrasena);

        await this.usuarioRepository.update(usuario.idUsuario, { contrasena: contrasenaHasheada });

        await this.codigoVerificacionRepository.deleteByCorreo(data.correo);
    }
}
