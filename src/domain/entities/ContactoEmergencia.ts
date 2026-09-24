export class ContactoEmergencia {
  idContactoEmergencia?: number;
  telefono: string;
  correo: string;
  nombres: string;
  apellidos: string;
  parentesco: string;
  pacienteId?: number;

  constructor(
    idContactoEmergencia: number | null,
    telefono: string,
    correo: string,
    nombres: string,
    apellidos: string,
    parentesco: string,
    pacienteId: number | null,
  ) {
    this.idContactoEmergencia = idContactoEmergencia ?? undefined;
    this.telefono = telefono;
    this.correo = correo;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.parentesco = parentesco;
    this.pacienteId = pacienteId ?? undefined;
  }
}
