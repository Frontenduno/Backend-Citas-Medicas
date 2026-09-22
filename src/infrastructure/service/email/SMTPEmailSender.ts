import * as nodemailer from 'nodemailer';
import { EmailSender } from '../../../application/ports/EmailSender';
import { Logger } from '../../../application/ports/Logger';

export class SMTPEmailSender implements EmailSender {
  private transporter: nodemailer.Transporter;

  constructor(private logger: Logger) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async enviarCodigoVerificacion(params: { destinatario: string; nombre: string; codigo: string; }): Promise<void> {
    const from = process.env.EMAIL_FROM || '"J&PMedic" <no-reply@jypmedic.com>';
    const mailOptions = {
      from,
      to: params.destinatario,
      subject: 'Código de Verificación - J&PMedic',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">¡Hola ${params.nombre}!</h2>
          <p>Tu código de verificación es:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${params.codigo}</h1>
          </div>
          <p>Este código expirará en 15 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #6c757d; font-size: 12px; text-align: center;">Equipo de Soporte de J&PMedic</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.info('Correo de verificación enviado por SMTP', { proveedor: 'SMTP' });
    } catch (error) {
      this.logger.error('Error enviando correo por SMTP', error as Error);
      throw new Error('Fallo al enviar correo');
    }
  }
}

