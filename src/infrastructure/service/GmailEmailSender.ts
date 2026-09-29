import nodemailer from 'nodemailer';
import { IEmailSender } from '../../application/ports/IEmailSender';

export class GmailEmailSender implements IEmailSender {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async enviarCodigoVerificacion(correo: string, codigo: string): Promise<void> {
    const mailOptions = {
      from: `"Sistema Médico JYP" <${process.env.GMAIL_USER}>`,
      to: correo,
      subject: 'Código de Verificación - Sistema Médico JYP',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Sistema Médico JYP</h1>
            <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Verificación de Correo Electrónico</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Hemos recibido una solicitud de registro con este correo electrónico. 
              Ingresa el siguiente código para verificar tu cuenta:
            </p>
            <div style="background: #f0f5ff; border: 2px dashed #2563eb; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 24px;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1d4ed8; font-family: 'Courier New', monospace;">${codigo}</span>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 8px;">
              ⏳ Este código expira en <strong>15 minutos</strong>.
            </p>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
              Si no solicitaste este registro, puedes ignorar este mensaje.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Sistema Médico JYP. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
