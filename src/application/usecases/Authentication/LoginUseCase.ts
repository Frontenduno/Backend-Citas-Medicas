import { IUsuarioRepository } from "../../../domain/repositories/UsuarioRepository";
import { IBcryptHasher } from "../../ports/BcryptHasher";
import { IJwtGenerator } from "../../ports/JwtGenerator";
import { CredencialesIncorrectasException } from "../../exception/CredencialesIncorrectasException";

export interface LoginUseCaseDependencies {
  usuarioRepository: IUsuarioRepository;
  bcryptHasher: IBcryptHasher;
  jwtGenerator: IJwtGenerator;
  credencialesIncorrectasException: CredencialesIncorrectasException;
}

export interface LoginUsuarioInfo {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
}

export interface LoginUseCaseResult {
  token: string;
  usuario: LoginUsuarioInfo;
}

export class LoginUseCase {
  private usuarioRepository: IUsuarioRepository;
  private bcryptHasher: IBcryptHasher;
  private jwtGenerator: IJwtGenerator;
  private credencialesIncorrectasException: CredencialesIncorrectasException;

  constructor(deps: LoginUseCaseDependencies) {
    this.usuarioRepository = deps.usuarioRepository;
    this.bcryptHasher = deps.bcryptHasher;
    this.jwtGenerator = deps.jwtGenerator;
    this.credencialesIncorrectasException =
      deps.credencialesIncorrectasException;
  }

  async execute(
    correo: string,
    contrasena: string,
  ): Promise<LoginUseCaseResult> {
    const usuario = await this.usuarioRepository.findUsuariobyEmail(correo);

    if (
      !usuario ||
      !(await this.bcryptHasher.compararContrasenas(
        contrasena,
        usuario.contrasena,
      ))
    ) {
      throw this.credencialesIncorrectasException;
    }

    const payload = {
      id: usuario.idUsuario!,
      correo: usuario.correo,
      rol: usuario.rol,
    };
    const token = this.jwtGenerator.firmarCredenciales(payload);

    return {
      token,
      usuario: {
        idUsuario: usuario.idUsuario!,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }
}
