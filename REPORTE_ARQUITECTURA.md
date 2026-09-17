# Reporte del Análisis del Proyecto Backend de Citas Médicas

Este documento contiene el análisis detallado del proyecto backend de citas médicas, su arquitectura, estructura de carpetas y el propósito de cada uno de los componentes del código fuente.

---

## 1. Visión General del Proyecto

El proyecto es una **API REST** para la gestión de citas médicas desarrollada con **Node.js**, **Express**, **TypeScript** y **MySQL**. 

Está diseñado bajo los principios de **Arquitectura Limpia (Clean Architecture)** y **Arquitectura Hexagonal (Puertos y Adaptadores)**. Esta organización garantiza que la lógica central del negocio permanezca totalmente desacoplada de los detalles técnicos y de infraestructura (como frameworks HTTP, librerías de encriptación o bases de datos específicas).

---

## 2. Patrón Arquitectónico y Flujo de Control

El código se organiza en cuatro capas claramente delimitadas:

```
[ Capa de Presentación (Express Controllers/Routes) ]
                         │
                         ▼
  [ Capa de Aplicación (Use Cases & Ports) ]
                         │
                         ▼
    [ Capa de Dominio (Entities & Interfaces) ]
                         ▲
                         │
  [ Capa de Infraestructura (MySQL / Services) ]
```

1. **Domain (Dominio)**: Representa el núcleo del negocio (entidades puras e interfaces de repositorios). No tiene dependencias externas.
2. **Application (Aplicación)**: Orquesta los casos de uso, las excepciones del negocio y los contratos/puertos de servicios externos.
3. **Infrastructure (Infraestructura)**: Implementaciones técnicas concretas (consultas MySQL, hash bcrypt, firma de tokens JWT, transacciones).
4. **Presenter (Presentación)**: Punto de entrada HTTP de la API REST utilizando Express Router y Controllers.

Las dependencias se inyectan de forma centralizada mediante el patrón **Composition Root** (`CompositionRoot.ts`).

---

## 3. Estructura de la Raíz del Proyecto

| Archivo / Carpeta | Descripción |
| :--- | :--- |
| `index.ts` | Punto de entrada principal del servidor Express. Configura middlewares (`cors`, `express.json`, `cookie-parser`), monta las rutas y levanta el servidor HTTP. |
| `CompositionRoot.ts` | Contenedor de Inyección de Dependencias (Composition Root). Instancia e interconecta repositorios, servicios, casos de uso y controladores. |
| `package.json` | Define las dependencias del proyecto (`express`, `mysql2`, `bcryptjs`, `jsonwebtoken`, `morgan`, `cookie-parser`) y los scripts de ejecución (`npm start`, `npm test`). |
| `tsconfig.json` | Configuración del compilador de TypeScript. |
| `jest.config.js` | Configuración del ejecutor de pruebas Jest con soporte para TypeScript (`ts-jest`). |
| `.env.example` | Plantilla de variables de entorno (credenciales de MySQL, puerto del servidor, clave secreta JWT). |
| `requests.http` | Archivo con solicitudes HTTP de prueba para ejecutar con la extensión REST Client. |
| `migrations/` | Directorio con scripts SQL de creación e inicialización de la base de datos MySQL (`001_init_db.sql`, `Script_test_v1.1.sql`). |
| `src/` | Código fuente principal de la aplicación. |
| `test/` | Suite de pruebas unitarias y de integración. |

---

## 4. Desglose del Código Fuente (`src/`)

### 4.1. `src/domain/` (Capa de Dominio)

Contiene el modelo de dominio y los contratos de persistencia.

- **`entity/` (Entidades)**:
  - `Usuario.ts`: Modelo fundamental de usuario (nombres, apellidos, correo, contraseña, rol, etc.).
  - `Paciente.ts`: Entidad de paciente con datos específicos de salud y relación con usuario.
  - `ContactoEmergencia.ts`: Entidad para contactos de emergencia vinculados a un paciente.
- **`repository/` (Interfaces de Repositorio)**:
  - `UsuarioRepository.ts`: Contrato de persistencia para operaciones sobre la entidad `Usuario`.
  - `PacienteRepository.ts`: Contrato de persistencia para operaciones sobre `Paciente`.
  - `ContactoEmergenciaRepository.ts`: Contrato para gestión de `ContactoEmergencia`.

### 4.2. `src/application/` (Capa de Aplicación)

Contiene la lógica de negocio orientada a casos de uso.

- **`usecases/` (Casos de Uso)**:
  - `Authentication/RegisterUseCase.ts`: Proceso de registro atómico de usuarios/pacientes con encriptación de contraseña y transacciones.
  - `Authentication/LoginUseCase.ts`: Validación de credenciales y generación de tokens JWT.
  - `Paciente/RegistrarContactoEmergenciaUseCase.ts`: Asignación de contactos de emergencia a pacientes.
- **`ports/` (Puertos / Abstracciones)**:
  - `BcryptHasher.ts`: Interfaz para encriptar y comparar contraseñas.
  - `JwtGenerator.ts`: Interfaz para generar y verificar tokens JWT.
  - `TransactionManager.ts`: Interfaz para manejar transacciones de base de datos (`BEGIN`, `COMMIT`, `ROLLBACK`).
- **`exception/` (Excepciones de Negocio)**:
  - `CorreoRegistradoException.ts`: Error cuando el correo ya existe en el sistema.
  - `CredencialesIncorrectasException.ts`: Error cuando el login falla por datos inválidos.

### 4.3. `src/infrastructure/` (Capa de Infraestructura)

Implementaciones concretas orientadas a frameworks y drivers de base de datos.

- **`database/`**:
  - `PoolConexion.ts`: Creación y gestión del pool de conexiones MySQL.
  - `TransactionManagerImpl.ts`: Implementación de transacciones para MySQL.
- **`repositories/`**:
  - `UserRepositoryMySQL.ts`: Consultas e inserciones SQL para la tabla `usuarios`.
  - `PacienteRepositoryMySQL.ts`: Consultas e inserciones SQL para la tabla `pacientes`.
  - `ContactoEmergenciaMySQL.ts`: Operaciones SQL para contactos de emergencia.
- **`service/`**:
  - `BcryptHasherImpl.ts`: Adaptador que utiliza la librería `bcryptjs`.
  - `JwtGeneratorImpl.ts`: Adaptador que utiliza la librería `jsonwebtoken`.

### 4.4. `src/presenter/` (Capa de Presentación / API HTTP)

- **`controllers/`**:
  - `AuthController.ts`: Controlador de endpoints `/register` y `/login`. Mapea solicitudes HTTP a los Casos de Uso.
  - `PacienteController.ts`: Controlador para endpoints de gestión de pacientes y sus contactos de emergencia.
- **`routes/`**:
  - `authRoutes.ts`: Enrutador Express para las rutas de autenticación (`/api/auth`).
  - `paciente.routes.ts`: Enrutador Express para las rutas de paciente (`/api/paciente`).

---

## 5. Estrategia de Pruebas (`test/`)

El sistema cuenta con una suite organizada en dos niveles de pruebas:

1. **`test/unit/` (Pruebas Unitarias)**:
   - Evalúan clases y funciones en aislamiento utilizando dobles de prueba (Mocks / Stubs).
   - Cobertura en `domain/` (`Usuario.test.ts`, `Paciente.test.ts`), `port/` (`TransactionManager.test.ts`), `repository/` y `usecase/` (`LoginUseCase.test.ts`, `RegisterUseCase.test.ts`).

2. **`test/integration/` (Pruebas de Integración)**:
   - Verifican el comportamiento conjunto interactuando con la base de datos real o de test.
   - Evaluaciones en `database/` (`PoolConexion.test.ts`, `TransactionManagerImpl.test.ts`), `repository/` (`UsuarioRepositoryMySQL.test.ts`, `PacienteRepositoryMySQL.test.ts`) y `usecase/` (`LoginUseCase.test.ts`, `RegisterUseCase.test.ts`).

