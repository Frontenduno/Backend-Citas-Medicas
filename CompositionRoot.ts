import express, { Application } from "express";
import morgan from "morgan";

import { createAuthController } from "./src/presenter/controllers/AuthController";
import { createAuthRoutes } from "./src/presenter/routes/auth.routes";
import { RegisterUseCase } from "./src/application/usecases/Authentication/RegisterUseCase";
import { LoginUseCase } from "./src/application/usecases/Authentication/LoginUseCase";
import { MySQLUserRepository } from "./src/infrastructure/repositories/MySQLUserRepository";
import { PacienteRepositoryMySQL } from "./src/infrastructure/repositories/PacienteRepositoryMySQL";
import { JwtGeneratorImpl } from "./src/infrastructure/service/JwtGeneratorImpl";
import { BcryptHasherImpl } from "./src/infrastructure/service/BcryptHasherImpl";
import { TransactionManagerImpl } from "./src/infrastructure/database/TransactionManagerImpl";
import { CredencialesIncorrectasException } from "./src/application/exception/CredencialesIncorrectasException";
import { CorreoRegistradoException } from "./src/application/exception/CorreoRegistradoException";
import { ContactoEmergenciaMySQL } from "./src/infrastructure/repositories/ContactoEmergenciaMySQL";
import { RegistrarContactoEmergenciaUseCase } from "./src/application/usecases/Paciente/RegistrarContactoEmergenciaUseCase";
import { createPacienteController } from "./src/presenter/controllers/PacienteController";
import { createPacienteRoutes } from "./src/presenter/routes/paciente.routes";

import { MySQLCitaRepository } from "./src/infrastructure/repositories/MySQLCitaRepository";
import { ICitaRepository } from "./src/domain/repositories/ICitaRepository";
import { CreateCitaUseCase } from "./src/application/usecases/citas/CreateCitaUseCase";
import { GetCitaByIdUseCase } from "./src/application/usecases/citas/GetCitaByIdUseCase";
import { GetCitasByPacienteUseCase } from "./src/application/usecases/citas/GetCitasByPacienteUseCase";
import { GetCitasByMedicoUseCase } from "./src/application/usecases/citas/GetCitasByMedicoUseCase";
import { GetCitasByFechaUseCase } from "./src/application/usecases/citas/GetCitasByFechaUseCase";
import { UpdateEstadoCitaUseCase } from "./src/application/usecases/citas/UpdateEstadoCitaUseCase";
import { DeleteCitaUseCase } from "./src/application/usecases/citas/DeleteCitaUseCase";
import { CheckDisponibilidadUseCase } from "./src/application/usecases/citas/CheckDisponibilidadUseCase";
import { CitaController } from "./src/presenter/controllers/CitaController";
import { createCitaRouter } from "./src/presenter/routes/citaRoutes";
import { FindUserByEmailUseCase } from "./src/application/usecases/users/FindUserByEmailUseCase";
import { ExistsUserByEmailUseCase } from "./src/application/usecases/users/ExistsUserByEmailUseCase";
import { IUsuarioRepository } from "./src/domain/repositories/UsuarioRepository";

export function createCompositionRoot() {
  // Repositories (Infrastructure)
  const usuarioRepository: IUsuarioRepository = new MySQLUserRepository();
  const pacienteRepository = new PacienteRepositoryMySQL();
  const contactoEmergenciaRepository = new ContactoEmergenciaMySQL();
  const citaRepository: ICitaRepository = new MySQLCitaRepository();

  // Ports / Services
  const jwtGenerator = new JwtGeneratorImpl();
  const bcryptHasher = new BcryptHasherImpl();
  const transactionManager = new TransactionManagerImpl();

  // Use Cases - Citas (Application)
  const createCitaUseCase = new CreateCitaUseCase(citaRepository);
  const getCitaByIdUseCase = new GetCitaByIdUseCase(citaRepository);
  const getCitasByPacienteUseCase = new GetCitasByPacienteUseCase(citaRepository);
  const getCitasByMedicoUseCase = new GetCitasByMedicoUseCase(citaRepository);
  const getCitasByFechaUseCase = new GetCitasByFechaUseCase(citaRepository);
  const updateEstadoCitaUseCase = new UpdateEstadoCitaUseCase(citaRepository);
  const deleteCitaUseCase = new DeleteCitaUseCase(citaRepository);
  const checkDisponibilidadUseCase = new CheckDisponibilidadUseCase(citaRepository);

  // Use Cases - Usuarios (Application)
  const findUserByEmailUseCase = new FindUserByEmailUseCase(usuarioRepository);
  const existsUserByEmailUseCase = new ExistsUserByEmailUseCase(usuarioRepository);

  // Use Cases - Auth (Application)
  const registerUseCase = new RegisterUseCase({
    usuarioRepository,
    pacienteRepository,
    bcryptHasher,
    transactionManager,
    correoRegistradoException: new CorreoRegistradoException(),
  });

  const loginUseCase = new LoginUseCase({
    usuarioRepository,
    bcryptHasher,
    jwtGenerator,
    credencialesIncorrectasException: new CredencialesIncorrectasException(),
  });

  // Use Cases - Paciente (Application)
  const registrarContactoEmergenciaUseCase =
    new RegistrarContactoEmergenciaUseCase(
      contactoEmergenciaRepository,
      transactionManager,
      pacienteRepository,
    );

  // Controllers
  const authController = createAuthController({
    registerUseCase,
    loginUseCase,
  });
  const pacienteController = createPacienteController(
    registrarContactoEmergenciaUseCase,
    jwtGenerator,
  );
  const citaController = new CitaController(
    createCitaUseCase,
    getCitaByIdUseCase,
    getCitasByPacienteUseCase,
    getCitasByMedicoUseCase,
    getCitasByFechaUseCase,
    updateEstadoCitaUseCase,
    deleteCitaUseCase,
    checkDisponibilidadUseCase,
  );

  // Routes
  const authRoutes = createAuthRoutes(authController);
  const pacienteRoutes = createPacienteRoutes(pacienteController);
  const citaRouter = createCitaRouter(citaRepository);

  return { authRoutes, pacienteRoutes, citaRouter };
}
