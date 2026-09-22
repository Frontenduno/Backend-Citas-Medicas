import { EmailSender } from '../../../application/ports/EmailSender';
import { Logger } from '../../../application/ports/Logger';
import { SMTPEmailSender } from './SMTPEmailSender';
import { SendGridEmailSender } from './SendGridEmailSender';

export class EmailSenderFactory {
  static crear(provider: string, logger: Logger): EmailSender {
    switch (provider.toLowerCase()) {
      case 'sendgrid':
        return new SendGridEmailSender(logger);
      case 'smtp':
      default:
        return new SMTPEmailSender(logger);
    }
  }
}

