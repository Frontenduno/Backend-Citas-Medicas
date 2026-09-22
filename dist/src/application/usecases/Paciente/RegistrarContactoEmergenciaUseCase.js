"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrarContactoEmergenciaUseCase = void 0;
class RegistrarContactoEmergenciaUseCase {
    constructor(contactoEmergenciaRepository, transactionManager, pacienteRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
        this.transactionManager = transactionManager;
        this.pacienteRepository = pacienteRepository;
    }
    async execute(newContacto, idUsuario) {
        await this.transactionManager.withTransaction(async (connection) => {
            const result = await this.pacienteRepository.findByIdUsuario(idUsuario, connection);
            newContacto.pacienteId = result.idPaciente;
            await this.contactoEmergenciaRepository.register(newContacto, connection);
        });
    }
}
exports.RegistrarContactoEmergenciaUseCase = RegistrarContactoEmergenciaUseCase;
