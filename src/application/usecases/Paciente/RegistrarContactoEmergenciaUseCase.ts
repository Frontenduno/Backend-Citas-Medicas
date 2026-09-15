import { IContactoEmergenciaRepository } from "../../../domain/repository/ContactoEmergenciaRepository";
import { ContactoEmergencia } from "../../../domain/entity/ContactoEmergencia";
import { ITransactionManager } from "../../ports/TransactionManager";
import { IPacienteRepository } from "../../../domain/repository/PacienteRepository";
export class RegistrarContactoEmergenciaUseCase {
  contactoEmergenciaRepository: IContactoEmergenciaRepository;
  pacienteRepository: IPacienteRepository;
  transactionManager: ITransactionManager;

  constructor(
    contactoEmergenciaRepository: IContactoEmergenciaRepository,
    transactionManager: ITransactionManager,
    pacienteRepository: IPacienteRepository,
  ) {
    this.contactoEmergenciaRepository = contactoEmergenciaRepository;
    this.transactionManager = transactionManager;
    this.pacienteRepository = pacienteRepository;
  }

  async execute(
    newContacto: ContactoEmergencia,
    idUsuario: number,
  ): Promise<void> {
    await this.transactionManager.withTransaction(async (connection: any) => {
      const result = await this.pacienteRepository.findByIdUsuario(
        idUsuario,
        connection,
      );

      newContacto.pacienteId = result.idPaciente;

      await this.contactoEmergenciaRepository.register(newContacto, connection);
    });
  }
}
