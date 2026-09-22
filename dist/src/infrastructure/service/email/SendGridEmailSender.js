"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridEmailSender = void 0;
// Nota: en un caso real se instalaría @sendgrid/mail
// import sgMail from '@sendgrid/mail';
class SendGridEmailSender {
    constructor(logger) {
        this.logger = logger;
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    }
    async enviarCodigoVerificacion(params) {
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
        }
        catch (error) {
            this.logger.error('Error enviando correo por SendGrid', error);
            throw new Error('Fallo al enviar correo');
        }
    }
}
exports.SendGridEmailSender = SendGridEmailSender;
