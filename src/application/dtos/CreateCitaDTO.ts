export interface CreateCitaDTO {
  pacienteId: number;
  medicoId: number;
  fecha: string;
  hora: string;
  motivo?: string | null;
}

