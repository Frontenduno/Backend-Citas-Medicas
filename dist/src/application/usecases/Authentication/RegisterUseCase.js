"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
const Usuario_1 = require("../../../domain/entity/Usuario");
const Paciente_1 = require("../../../domain/entity/Paciente");
class RegisterUseCase {
    constructor(deps) {
        this.usuarioRepository = deps.usuarioRepository;
        this.pacienteRepository = deps.pacienteRepository;
        this.bcryptHasher = deps.bcryptHasher;
        this.transactionManager = deps.transactionManager;
        this.correoRegistradoException = deps.correoRegistradoException;
    }
    async execute(nuevoPaciente) {
        return await this.transactionManager.withTransaction(async (connection) => {
            if (await this.usuarioRepository.existsByEmail(nuevoPaciente.correo, connection)) {
                throw this.correoRegistradoException;
            }
            const contrasenaHasheada = await this.bcryptHasher.encriptarContrasena(nuevoPaciente.contrasena);
            const newUsuario = new Usuario_1.Usuario(null, contrasenaHasheada, nuevoPaciente.nombres, nuevoPaciente.apellidos, nuevoPaciente.correo, nuevoPaciente.telefono, nuevoPaciente.fecha_nacimiento, nuevoPaciente.genero, 'Paciente');
            const createdIdUsuario = await this.usuarioRepository.create(newUsuario, connection);
            const newPaciente = new Paciente_1.Paciente(null, createdIdUsuario);
            await this.pacienteRepository.create(newPaciente, connection);
            return { idUsuario: createdIdUsuario };
        });
    }
}
exports.RegisterUseCase = RegisterUseCase;
