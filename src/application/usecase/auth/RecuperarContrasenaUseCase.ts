import { CodigoVerificacionRepository } from "../../../domain/repository/CodigoVerificacionRepository";
import { UsuarioRepository } from "../../../domain/repository/UsuarioRepository";
import { RecuperarContrasenaDTO } from "../../dto/AuthDTO";
import { CodigoExpiradoException } from "../../exception/CodigoExpiradoException";
import { CodigoInvalidoException } from "../../exception/CodigoInvalidoException";
import { UsuarioNoEncontradoException } from "../../exception/UsuarioNoEncontradoException";
import { PasswordHasher } from "../../port/PasswordHasher";
import { TransactionManager } from "../../port/TransactionManager";

export class RecuperarContrasenaUseCase {
    private readonly codigoVerificacionRepository: CodigoVerificacionRepository;
    private readonly usuarioRepository: UsuarioRepository;
    private readonly passwordHasher: PasswordHasher;
    private readonly transactionManager: TransactionManager;

    constructor(
        codigoVerificacionRepository: CodigoVerificacionRepository,
        usuarioRepository: UsuarioRepository,
        passwordHasher: PasswordHasher,
        transactionManager: TransactionManager
    ) {
        this.codigoVerificacionRepository = codigoVerificacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordHasher = passwordHasher;
        this.transactionManager = transactionManager;
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

        // Actualizar la contraseña y consumir el código deben ocurrir juntos.
        await this.transactionManager.ejecutar(async () => {
            await this.usuarioRepository.update(usuario.idUsuario, { contrasena: contrasenaHasheada });
            await this.codigoVerificacionRepository.deleteByCorreo(data.correo);
        });
    }
}
