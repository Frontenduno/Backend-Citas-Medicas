"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerEmailSender = void 0;
const nodemailer = __importStar(require("nodemailer"));
class NodemailerEmailSender {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASS
            }
        });
    }
    async enviarCodigoVerificacion(params) {
        const mailOptions = {
            from: `"J&PMedic" <${process.env.GMAIL_USER}>`,
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
        await this.transporter.sendMail(mailOptions);
    }
}
exports.NodemailerEmailSender = NodemailerEmailSender;
