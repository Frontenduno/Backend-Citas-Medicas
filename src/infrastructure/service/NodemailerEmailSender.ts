import nodemailer, { Transporter } from "nodemailer";
import { EmailSender } from "../../application/port/EmailSender";

export class NodemailerEmailSender implements EmailSender {
    private readonly transporter: Transporter;
    private readonly fromEmail: string;

    constructor() {
        this.fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@citasmedicas.com";
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER || "",
                pass: process.env.SMTP_PASS || ""
            }
        });
    }

    async enviarEmail(email: string, asunto: string, mensaje: string): Promise<void> {
        await this.transporter.sendMail({
            from: this.fromEmail,
            to: email,
            subject: asunto,
            text: mensaje,
            html: `<p>${mensaje.replace(/\n/g, "<br/>")}</p>`
        });
    }
}
