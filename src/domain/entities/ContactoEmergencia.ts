export class ContactoEmergencia {
  constructor(
    public readonly idContactoEmergencia: number,
    public readonly telefono: string,
    public readonly correo: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly parentesco: string,
    public readonly Paciente_idPaciente: number | null,
  ) {}
}
