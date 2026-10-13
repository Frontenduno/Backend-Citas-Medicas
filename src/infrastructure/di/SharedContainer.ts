import { PasswordHasher } from '../../application/port/PasswordHasher';
import { JwtGenerator } from '../../application/port/JwtGenerator';
import { EmailSender } from '../../application/port/EmailSender';
import { CodeGenerator } from '../../application/port/CodeGenerator';

import { BcryptPasswordHasher } from '../service/BcryptPasswordHasher';
import { JsonWebTokenGenerator } from '../service/JsonWebTokenGenerator';
import { NodemailerEmailSender } from '../service/NodemailerEmailSender';
import { RandomCodeGenerator } from '../service/RandomCodeGenerator';
import { prisma } from '../database/prisma';

export class SharedContainer {
  private static _passwordHasher: PasswordHasher;
  private static _jwtGenerator: JwtGenerator;
  private static _emailSender: EmailSender;
  private static _codeGenerator: CodeGenerator;

  static get prisma() {
    return prisma;
  }

  static get passwordHasher(): PasswordHasher {
    if (!this._passwordHasher) {
      this._passwordHasher = new BcryptPasswordHasher();
    }
    return this._passwordHasher;
  }

  static get jwtGenerator(): JwtGenerator {
    if (!this._jwtGenerator) {
      this._jwtGenerator = new JsonWebTokenGenerator();
    }
    return this._jwtGenerator;
  }

  static get emailSender(): EmailSender {
    if (!this._emailSender) {
      this._emailSender = new NodemailerEmailSender();
    }
    return this._emailSender;
  }

  static get codeGenerator(): CodeGenerator {
    if (!this._codeGenerator) {
      this._codeGenerator = new RandomCodeGenerator();
    }
    return this._codeGenerator;
  }

  // Métodos para facilitar la inyección de mocks si se requiere en tests
  static setPasswordHasher(instance: PasswordHasher): void {
    this._passwordHasher = instance;
  }

  static setJwtGenerator(instance: JwtGenerator): void {
    this._jwtGenerator = instance;
  }

  static setEmailSender(instance: EmailSender): void {
    this._emailSender = instance;
  }

  static setCodeGenerator(instance: CodeGenerator): void {
    this._codeGenerator = instance;
  }
}
