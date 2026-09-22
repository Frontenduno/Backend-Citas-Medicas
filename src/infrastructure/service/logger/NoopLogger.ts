import { Logger } from '../../../application/ports/Logger';

export class NoopLogger implements Logger {
  info(): void {}
  warn(): void {}
  error(): void {}
}

