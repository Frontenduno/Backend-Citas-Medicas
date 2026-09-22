import { ContactoEmergencia } from "../entity/ContactoEmergencia";

export interface IContactoEmergenciaRepository {
  register(
    contactoEmergencia: ContactoEmergencia,
    connection?: any,
  ): Promise<number>;
}
