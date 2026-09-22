"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
class LoginUseCase {
    constructor(deps) {
        this.usuarioRepository = deps.usuarioRepository;
        this.bcryptHasher = deps.bcryptHasher;
        this.jwtGenerator = deps.jwtGenerator;
        this.credencialesIncorrectasException =
            deps.credencialesIncorrectasException;
    }
    async execute(correo, contrasena) {
        const usuario = await this.usuarioRepository.findByEmail(correo);
        if (!usuario ||
            !(await this.bcryptHasher.compararContrasenas(contrasena, usuario.contrasena))) {
            throw this.credencialesIncorrectasException;
        }
        const payload = {
            id: usuario.idUsuario,
            correo: usuario.correo,
            rol: usuario.rol,
        };
        const token = this.jwtGenerator.firmarCredenciales(payload);
        return {
            token,
            usuario: {
                idUsuario: usuario.idUsuario,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                correo: usuario.correo,
                rol: usuario.rol,
            },
        };
    }
}
exports.LoginUseCase = LoginUseCase;
