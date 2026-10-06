import { CodigoVerificacion } from "../../../domain/entity/CodigoVerificacion";
import { CodigoVerificacionRepository } from "../../../domain/repository/CodigoVerificacionRepository";
import { UsuarioRepository } from "../../../domain/repository/UsuarioRepository";
import { ReenviarCodigoDTO } from "../../dto/AuthDTO";
import { UsuarioNoEncontradoException } from "../../exception/UsuarioNoEncontradoException";
import { UsuarioYaVerificadoException } from "../../exception/UsuarioYaVerificadoException";
import { CodeGenerator } from "../../port/CodeGenerator";
import { EmailSender } from "../../port/EmailSender";

export class ReenviarCodigoUseCase {
    private readonly usuarioRepository: UsuarioRepository;
    private readonly codigoVerificacionRepository: CodigoVerificacionRepository;
    private readonly codeGenerator: CodeGenerator;
    private readonly emailSender: EmailSender;

    constructor(
        usuarioRepository: UsuarioRepository,
        codigoVerificacionRepository: CodigoVerificacionRepository,
        codeGenerator: CodeGenerator,
        emailSender: EmailSender
    ) {
        this.usuarioRepository = usuarioRepository;
        this.codigoVerificacionRepository = codigoVerificacionRepository;
        this.codeGenerator = codeGenerator;
        this.emailSender = emailSender;
    }

    async ejecutar(data: ReenviarCodigoDTO): Promise<void> {
        const usuario = await this.usuarioRepository.findByCorreo(data.correo);
        if (!usuario) {
            throw new UsuarioNoEncontradoException();
        }

        if (usuario.verificado) {
            throw new UsuarioYaVerificadoException();
        }

        await this.codigoVerificacionRepository.deleteByCorreo(data.correo);

        const codigo = this.codeGenerator.generateCode();
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

        const codigoVerificacion = new CodigoVerificacion(
            0,
            data.correo,
            codigo,
            fechaExpiracion
        );

        await this.codigoVerificacionRepository.save(codigoVerificacion);

        await this.emailSender.enviarEmail(
            data.correo,
            "Nuevo Código de Verificación - Citas Médicas",
            `Hola ${usuario.nombres}, tu nuevo código de verificación es: ${codigo}. Expira en 15 minutos.`
        );
    }
}
