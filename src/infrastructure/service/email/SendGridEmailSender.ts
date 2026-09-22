import { EmailSender } from '../../../application/ports/EmailSender';
import { Logger } from '../../../application/ports/Logger';

// Nota: en un caso real se instalaría @sendgrid/mail
// import sgMail from '@sendgrid/mail';

export class SendGridEmailSender implements EmailSender {
  constructor(private logger: Logger) {
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  async enviarCodigoVerificacion(params: { destinatario: string; nombre: string; codigo: string; }): Promise<void> {
    const from = process.env.EMAIL_FROM || 'no-reply@jypmedic.com';
    /*
    const msg = {
      to: params.destinatario,
      from,
      subject: 'Código de Verificación - J&PMedic',
      html: `...` // Mismo HTML que SMTP
    };
    */
    try {
      // await sgMail.send(msg);
      this.logger.info('Correo de verificación enviado por SendGrid (Mock)', { proveedor: 'SendGrid' });
    } catch (error) {
      this.logger.error('Error enviando correo por SendGrid', error as Error);
      throw new Error('Fallo al enviar correo');
    }
  }
}

