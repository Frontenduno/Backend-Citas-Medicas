export interface EmailSender {
    enviarEmail(email: string, asunto: string, mensaje: string): Promise<void>;
}