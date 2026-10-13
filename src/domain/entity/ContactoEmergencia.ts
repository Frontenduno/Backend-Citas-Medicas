import { Parentesco } from "../enum/Parentesco";

export class ContactoEmergencia {
  constructor(
    public readonly idContactoEmergencia: number,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly telefono: string,
    public readonly correo: string,
    public readonly parentesco: Parentesco,
    public readonly Paciente_idPaciente?: number
  ) { }
}