import nodemailer, { Transporter } from "nodemailer";
import { EmailSender } from "../../application/port/EmailSender";

export class NodemailerEmailSender implements EmailSender {
    private readonly transporter: Transporter;
    private readonly fromEmail: string;
    private readonly shouldSendRealEmail: boolean;
    private readonly smtpUser: string;
    private readonly smtpPass: string;

    constructor() {
        this.smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "";
        this.smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
        this.fromEmail = process.env.SMTP_FROM || this.smtpUser || "no-reply@citasmedicas.com";

        // En desarrollo se registra el correo en consola por defecto.
        // Para enviar correos reales en local: SMTP_ENABLED=true
        this.shouldSendRealEmail =
            process.env.NODE_ENV === "production" || process.env.SMTP_ENABLED === "true";

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: this.smtpUser,
                pass: this.smtpPass
            }
        });
    }

    async enviarEmail(email: string, asunto: string, mensaje: string): Promise<void> {
        if (!this.shouldSendRealEmail) {
            console.log(
                `\n[DEV][EMAIL] Para: ${email}\n[DEV][EMAIL] Asunto: ${asunto}\n[DEV][EMAIL] ${mensaje}\n`
            );
            return;
        }

        if (!this.smtpUser || !this.smtpPass) {
            throw new Error(
                "SMTP no configurado. Define SMTP_USER/SMTP_PASS (o GMAIL_USER/GMAIL_APP_PASSWORD)."
            );
        }

        await this.transporter.sendMail({
            from: this.fromEmail,
            to: email,
            subject: asunto,
            text: mensaje,
            html: `<p>${mensaje.replace(/\n/g, "<br/>")}</p>`
        });
    }
}
