import { ContactoEmergencia } from '../entity/ContactoEmergencia';

export interface ContactoEmergenciaRepository {
  save(contacto: ContactoEmergencia): Promise<ContactoEmergencia>;
  findById(id: number): Promise<ContactoEmergencia | null>;
  findByPacienteId(pacienteId: number): Promise<ContactoEmergencia[]>;
}
