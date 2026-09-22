import { Metrics } from '../../../application/ports/Metrics';

export class NoopMetrics implements Metrics {
  incrementar(): void {}
  observar(): void {}
}

