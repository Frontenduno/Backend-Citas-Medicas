export interface IEmailSender {
  enviarCodigoVerificacion(correo: string, codigo: string): Promise<void>;
}
