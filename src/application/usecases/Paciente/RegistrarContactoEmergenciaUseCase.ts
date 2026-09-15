import { IContactoEmergenciaRepository } from "../../../domain/repository/ContactoEmergenciaRepository";
import { ContactoEmergencia } from "../../../domain/entity/ContactoEmergencia";

export class RegistrarContactoEmergenciaUseCase {
  contactoEmergenciaRepository: IContactoEmergenciaRepository;

  constructor(contactoEmergenciaRepository: IContactoEmergenciaRepository) {
    this.contactoEmergenciaRepository = contactoEmergenciaRepository;
  }

  async execute(newContacto: ContactoEmergencia, id: number): Promise<void> {
    newContacto.idContactoEmergencia = id;

    await this.contactoEmergenciaRepository.register(newContacto);
  }
}
