import { CodigoVerificacion } from "../../../domain/entity/CodigoVerificacion";
import { Paciente } from "../../../domain/entity/Paciente";
import { Usuario } from "../../../domain/entity/Usuario";
import { Rol } from "../../../domain/enum/Rol";
import { CodigoVerificacionRepository } from "../../../domain/repository/CodigoVerificacionRepository";
import { PacienteRepository } from "../../../domain/repository/PacienteRepository";
import { UsuarioRepository } from "../../../domain/repository/UsuarioRepository";
import { RegistrarseDTO } from "../../dto/AuthDTO";
import { EmailNoEnviadoException } from "../../exception/EmailNoEnviadoException";
import { UsuarioYaExisteException } from "../../exception/UsuarioYaExisteException";
import { CodeGenerator } from "../../port/CodeGenerator";
import { EmailSender } from "../../port/EmailSender";
import { PasswordHasher } from "../../port/PasswordHasher";
import { TransactionManager } from "../../port/TransactionManager";

export class RegistrarseUseCase {
    private readonly usuarioRepository: UsuarioRepository;
    private readonly codigoVerificacionRepository: CodigoVerificacionRepository;
    private readonly passwordHasher: PasswordHasher;
    private readonly emailSender: EmailSender;
    private readonly codeGenerator: CodeGenerator;
    private readonly pacienteRepository: PacienteRepository;
    private readonly transactionManager: TransactionManager;

    constructor(
        usuarioRepository: UsuarioRepository,
        codigoVerificacionRepository: CodigoVerificacionRepository,
        passwordHasher: PasswordHasher,
        emailSender: EmailSender,
        codeGenerator: CodeGenerator,
        pacienteRepository: PacienteRepository,
        transactionManager: TransactionManager
    ) {
        this.usuarioRepository = usuarioRepository;
        this.codigoVerificacionRepository = codigoVerificacionRepository;
        this.passwordHasher = passwordHasher;
        this.emailSender = emailSender;
        this.codeGenerator = codeGenerator;
        this.pacienteRepository = pacienteRepository;
        this.transactionManager = transactionManager;
    }

    async ejecutar(data: RegistrarseDTO): Promise<void> {
        const usuarioExistente = await this.usuarioRepository.findByCorreo(data.correo);
        if (usuarioExistente) {
            throw new UsuarioYaExisteException();
        }

        // Operaciones costosas que no tocan la base de datos se realizan fuera
        // de la transacción para no mantenerla abierta innecesariamente.
        const contrasenaHasheada = await this.passwordHasher.hashearContrasena(data.contrasena);
        const codigo = this.codeGenerator.generateCode();
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

        const nuevoUsuario = new Usuario(
            0,
            contrasenaHasheada,
            data.nombres,
            data.apellidos,
            data.correo,
            data.documento_identidad,
            data.telefono,
            data.genero,
            data.fecha_nacimiento,
            data.rol,
            false
        );

        // Usuario, perfil de paciente, código de verificación y envío del correo
        // forman una sola unidad atómica: si cualquiera falla, no queda registro.
        await this.transactionManager.ejecutar(async () => {
            const usuarioCreado = await this.usuarioRepository.save(nuevoUsuario);

            // Todo usuario con rol PACIENTE necesita su perfil para poder consultar sus citas.
            if (data.rol === Rol.PACIENTE) {
                await this.pacienteRepository.save(
                    new Paciente(0, usuarioCreado.idUsuario)
                );
            }

            await this.codigoVerificacionRepository.deleteByCorreo(data.correo);

            const codigoVerificacion = new CodigoVerificacion(
                0,
                data.correo,
                codigo,
                fechaExpiracion
            );

            await this.codigoVerificacionRepository.save(codigoVerificacion);

            await this.enviarEmail(data, codigo);
        });
    }

    private async enviarEmail(data: RegistrarseDTO, codigo: string): Promise<void> {
        try {
            await this.emailSender.enviarEmail(
                data.correo,
                "Código de Verificación - Citas Médicas",
                `Hola ${data.nombres}, tu código de verificación es: ${codigo}. Expira en 15 minutos.`
            );
        } catch (error) {
            throw new EmailNoEnviadoException(error);
        }
    }
}
