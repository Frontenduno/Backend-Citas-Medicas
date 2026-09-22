export interface EmailSender {
  enviarCodigoVerificacion(params: {
    destinatario: string;
    nombre: string;
    codigo: string;
  }): Promise<void>;
}

