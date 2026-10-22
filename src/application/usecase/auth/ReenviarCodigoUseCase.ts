import { CodigoVerificacion } from "../../../domain/entity/CodigoVerificacion";
import { CodigoVerificacionRepository } from "../../../domain/repository/CodigoVerificacionRepository";
import { UsuarioRepository } from "../../../domain/repository/UsuarioRepository";
import { ReenviarCodigoDTO } from "../../dto/AuthDTO";
import { EmailNoEnviadoException } from "../../exception/EmailNoEnviadoException";
import { UsuarioNoEncontradoException } from "../../exception/UsuarioNoEncontradoException";
import { UsuarioYaVerificadoException } from "../../exception/UsuarioYaVerificadoException";
import { CodeGenerator } from "../../port/CodeGenerator";
import { EmailSender } from "../../port/EmailSender";
import { TransactionManager } from "../../port/TransactionManager";

export class ReenviarCodigoUseCase {
    private readonly usuarioRepository: UsuarioRepository;
    private readonly codigoVerificacionRepository: CodigoVerificacionRepository;
    private readonly codeGenerator: CodeGenerator;
    private readonly emailSender: EmailSender;
    private readonly transactionManager: TransactionManager;

    constructor(
        usuarioRepository: UsuarioRepository,
        codigoVerificacionRepository: CodigoVerificacionRepository,
        codeGenerator: CodeGenerator,
        emailSender: EmailSender,
        transactionManager: TransactionManager
    ) {
        this.usuarioRepository = usuarioRepository;
        this.codigoVerificacionRepository = codigoVerificacionRepository;
        this.codeGenerator = codeGenerator;
        this.emailSender = emailSender;
        this.transactionManager = transactionManager;
    }

    async ejecutar(data: ReenviarCodigoDTO): Promise<void> {
        const usuario = await this.usuarioRepository.findByCorreo(data.correo);
        if (!usuario) {
            throw new UsuarioNoEncontradoException();
        }

        if (usuario.verificado) {
            throw new UsuarioYaVerificadoException();
        }

        const codigo = this.codeGenerator.generateCode();
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

        const codigoVerificacion = new CodigoVerificacion(
            0,
            data.correo,
            codigo,
            fechaExpiracion
        );

        // Si el correo falla, se conserva el código anterior y no queda un
        // código nuevo que el usuario nunca podrá recibir.
        await this.transactionManager.ejecutar(async () => {
            await this.codigoVerificacionRepository.deleteByCorreo(data.correo);
            await this.codigoVerificacionRepository.save(codigoVerificacion);

            try {
                await this.emailSender.enviarEmail(
                    data.correo,
                    "Nuevo Código de Verificación - Citas Médicas",
                    `Hola ${usuario.nombres}, tu nuevo código de verificación es: ${codigo}. Expira en 15 minutos.`
                );
            } catch (error) {
                throw new EmailNoEnviadoException(error);
            }
        });
    }
}
