"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSenderFactory = void 0;
const SMTPEmailSender_1 = require("./SMTPEmailSender");
const SendGridEmailSender_1 = require("./SendGridEmailSender");
class EmailSenderFactory {
    static crear(provider, logger) {
        switch (provider.toLowerCase()) {
            case 'sendgrid':
                return new SendGridEmailSender_1.SendGridEmailSender(logger);
            case 'smtp':
            default:
                return new SMTPEmailSender_1.SMTPEmailSender(logger);
        }
    }
}
exports.EmailSenderFactory = EmailSenderFactory;
