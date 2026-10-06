import { IniciarSesionDTO } from "../../dto/AuthDTO";
import { Usuario } from "../../../domain/entity/Usuario";
import { UsuarioRepository } from "../../../domain/repository/UsuarioRepository";
import { JwtGenerator, Payload } from "../../port/JwtGenerator";
import { PasswordHasher } from "../../port/PasswordHasher";
import { CredencialesIncorrectasException } from "../../exception/CredencialesIncorrectasException";
import { CorreoNoVerificadoException } from "../../exception/CorreoNoVerificadoException";

export class IniciarSesionUseCase {

    private readonly usuarioRepository: UsuarioRepository;
    private readonly jwtGenerator: JwtGenerator;
    private readonly hashGenerator: PasswordHasher;

    constructor(
        usuarioRepository: UsuarioRepository,
        jwtGenerator: JwtGenerator,
        hashGenerator: PasswordHasher) {
        this.usuarioRepository = usuarioRepository;
        this.jwtGenerator = jwtGenerator;
        this.hashGenerator = hashGenerator;
    }

    async ejecutar(credenciales: IniciarSesionDTO): Promise<String> {
        const usuario = await this.usuarioRepository.findByCorreo(credenciales.correo);
        if (!usuario) {
            throw new CredencialesIncorrectasException();
        }

        const esValido = this.hashGenerator.compararContrasena(credenciales.contrasena, usuario.contrasena);
        if (!esValido) {
            throw new CredencialesIncorrectasException();
        }

        if (!usuario.verificado) {
            throw new CorreoNoVerificadoException();
        }

        const payload: Payload = {
            correo: usuario.correo,
            idUsuario: usuario.idUsuario.toString(),
            rol: usuario.rol
        }

        const token = await this.jwtGenerator.generarToken(payload);
        return token;
    }
}