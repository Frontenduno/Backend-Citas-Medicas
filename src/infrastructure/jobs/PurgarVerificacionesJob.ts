import * as cron from 'node-cron';
import { Logger } from '../../application/ports/Logger';
import { CodigoVerificacionRepository } from '../../application/ports/CodigoVerificacionRepository';

export class PurgarVerificacionesJob {
  private task: cron.ScheduledTask | null = null;

  constructor(
    private codigoRepo: CodigoVerificacionRepository,
    private logger: Logger
  ) {}

  start() {
    this.logger.info('Registrando cron job: PurgarVerificacionesJob (0 3 * * *)');
    
    // Se ejecuta a las 3:00 AM todos los días
    this.task = cron.schedule('0 3 * * *', async () => {
      this.logger.info('Ejecutando limpieza de verificaciones antiguas...');
      try {
        const purgados = await this.codigoRepo.purgarAntiguas(30);
        this.logger.info(`Limpieza completada. Registros eliminados: ${purgados}`);
      } catch (error) {
        this.logger.error('Error al purgar verificaciones antiguas', error as Error);
      }
    });
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.logger.info('Cron job detenido: PurgarVerificacionesJob');
    }
  }
}
