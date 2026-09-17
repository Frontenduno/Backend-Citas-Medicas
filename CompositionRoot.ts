import express, { Application } from 'express';
import morgan from 'morgan';

// Repositorios (Infrastructure)
import { MySQLCitaRepository } from './src/infrastructure/repositories/MySQLCitaRepository';
import { MySQLUserRepository } from './src/infrastructure/repositories/MySQLUserRepository';
import { ICitaRepository } from './src/domain/repositories/ICitaRepository';
import { IUserRepository } from './src/domain/repositories/IUserRepository';

// Casos de Uso - Citas (Application)
import { CreateCitaUseCase } from './src/application/use-cases/citas/CreateCitaUseCase';
import { GetCitaByIdUseCase } from './src/application/use-cases/citas/GetCitaByIdUseCase';
import { GetCitasByPacienteUseCase } from './src/application/use-cases/citas/GetCitasByPacienteUseCase';
import { GetCitasByMedicoUseCase } from './src/application/use-cases/citas/GetCitasByMedicoUseCase';
import { GetCitasByFechaUseCase } from './src/application/use-cases/citas/GetCitasByFechaUseCase';
import { UpdateEstadoCitaUseCase } from './src/application/use-cases/citas/UpdateEstadoCitaUseCase';
import { DeleteCitaUseCase } from './src/application/use-cases/citas/DeleteCitaUseCase';
import { CheckDisponibilidadUseCase } from './src/application/use-cases/citas/CheckDisponibilidadUseCase';

// Casos de Uso - Usuarios (Application)
import { FindUserByEmailUseCase } from './src/application/use-cases/users/FindUserByEmailUseCase';
import { ExistsUserByEmailUseCase } from './src/application/use-cases/users/ExistsUserByEmailUseCase';

// Controladores y Rutas (Presenter / HTTP)
import { CitaController } from './src/presenter/controllers/CitaController';
import { createCitaRouter } from './src/presenter/routes/citaRoutes';

/**
 * CompositionRoot: Centraliza la instanciación, configuración e inyección
 * de dependencias de todas las capas de la arquitectura limpia.
 */
export class CompositionRoot {
  private static instance: CompositionRoot;

  // 1. Repositorios (Capa de Infraestructura)
  public readonly citaRepository: ICitaRepository;
  public readonly userRepository: IUserRepository;

  // 2. Casos de Uso - Citas (Capa de Aplicación)
  public readonly createCitaUseCase: CreateCitaUseCase;
  public readonly getCitaByIdUseCase: GetCitaByIdUseCase;
  public readonly getCitasByPacienteUseCase: GetCitasByPacienteUseCase;
  public readonly getCitasByMedicoUseCase: GetCitasByMedicoUseCase;
  public readonly getCitasByFechaUseCase: GetCitasByFechaUseCase;
  public readonly updateEstadoCitaUseCase: UpdateEstadoCitaUseCase;
  public readonly deleteCitaUseCase: DeleteCitaUseCase;
  public readonly checkDisponibilidadUseCase: CheckDisponibilidadUseCase;

  // 3. Casos de Uso - Usuarios (Capa de Aplicación)
  public readonly findUserByEmailUseCase: FindUserByEmailUseCase;
  public readonly existsUserByEmailUseCase: ExistsUserByEmailUseCase;

  // 4. Controladores (Capa Presenter / HTTP)
  public readonly citaController: CitaController;

  // 5. Aplicación Express orquestada
  public readonly app: Application;

  private constructor() {
    // 1. Instanciar Repositorios
    this.citaRepository = new MySQLCitaRepository();
    this.userRepository = new MySQLUserRepository();

    // 2. Instanciar Casos de Uso de Citas inyectando el repositorio
    this.createCitaUseCase = new CreateCitaUseCase(this.citaRepository);
    this.getCitaByIdUseCase = new GetCitaByIdUseCase(this.citaRepository);
    this.getCitasByPacienteUseCase = new GetCitasByPacienteUseCase(this.citaRepository);
    this.getCitasByMedicoUseCase = new GetCitasByMedicoUseCase(this.citaRepository);
    this.getCitasByFechaUseCase = new GetCitasByFechaUseCase(this.citaRepository);
    this.updateEstadoCitaUseCase = new UpdateEstadoCitaUseCase(this.citaRepository);
    this.deleteCitaUseCase = new DeleteCitaUseCase(this.citaRepository);
    this.checkDisponibilidadUseCase = new CheckDisponibilidadUseCase(this.citaRepository);

    // 3. Instanciar Casos de Uso de Usuarios
    this.findUserByEmailUseCase = new FindUserByEmailUseCase(this.userRepository);
    this.existsUserByEmailUseCase = new ExistsUserByEmailUseCase(this.userRepository);

    // 4. Instanciar Controladores inyectando los casos de uso
    this.citaController = new CitaController(
      this.createCitaUseCase,
      this.getCitaByIdUseCase,
      this.getCitasByPacienteUseCase,
      this.getCitasByMedicoUseCase,
      this.getCitasByFechaUseCase,
      this.updateEstadoCitaUseCase,
      this.deleteCitaUseCase,
      this.checkDisponibilidadUseCase,
    );

    // 5. Configurar y orquestar Express Application
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  /**
   * Patrón Singleton para obtener la instancia única del Composition Root
   */
  public static getInstance(): CompositionRoot {
    if (!CompositionRoot.instance) {
      CompositionRoot.instance = new CompositionRoot();
    }
    return CompositionRoot.instance;
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(morgan('dev'));
  }

  private setupRoutes(): void {
    // Health check / Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        message: 'API Citas Médicas - Clean Architecture (TypeScript)',
        status: 'online',
      });
    });

    // Rutas de Citas
    this.app.use('/api/citas', createCitaRouter(this.citaRepository));
  }
}

// Exportar instancia por defecto lista para ser consumida
export const compositionRoot = CompositionRoot.getInstance();
export default compositionRoot;

