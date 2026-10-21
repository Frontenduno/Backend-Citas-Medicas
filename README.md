# Backend Citas Médicas - Pruebas con Postman

## 1. Preparar el entorno

```powershell
npm install
npm run db:migrate
npm run build
npm start
```

El servidor queda en `http://localhost:3000` y el health check en
`http://localhost:3000/health`.

Si cambias código TypeScript, vuelve a ejecutar `npm run build` antes de
`npm start`, porque `start` ejecuta `dist/index.js` (no `src/`).

## 2. Importar en Postman

1. Importa `docs/postman/Backend-Citas-Medicas.postman_collection.json`.
2. Importa `docs/postman/Backend-Citas-Medicas.postman_environment.json`.
3. Selecciona el environment **Backend Citas Médicas - Local**.

## 3. Flujo de autenticación

1. Ejecuta **Auth > Registro**. Usa un `correo` y `documento` nuevos.
2. En la consola donde corre `npm start` busca una línea como:

   ```text
   [DEV][EMAIL] ... tu código de verificación es: 123456
   ```

3. Copia el código en la variable `codigo` del environment.
4. Ejecuta **Auth > Verificar código**.
5. Ejecuta **Auth > Login**. Se guardan las cookies y la variable
   `accessToken` automáticamente.
6. Ejecuta **Paciente > GET /api/v1/paciente/citas**.

La colección también incluye refresh, logout, reenvío de código y
recuperación de contraseña.

## 4. Correos reales en desarrollo

Por defecto los correos se imprimen en consola para no enviar mensajes reales.
Para enviarlos:

```env
SMTP_ENABLED=true
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contrasena_de_aplicacion
```

También se aceptan `GMAIL_USER` y `GMAIL_APP_PASSWORD` como alternativa.

## 5. Endpoints

| Método | Ruta | Auth |
|---|---|---|
| GET | `/health` | No |
| POST | `/api/v1/auth/registro` | No |
| POST | `/api/v1/auth/verificar-codigo` | No |
| POST | `/api/v1/auth/login` | No |
| POST | `/api/v1/auth/refresh` | Cookie `refresh_token` |
| POST | `/api/v1/auth/reenviar-codigo` | No |
| POST | `/api/v1/auth/solicitar-recuperacion` | No |
| POST | `/api/v1/auth/recuperar-contrasena` | No |
| POST | `/api/v1/auth/logout` | Cookie `refresh_token` |
| GET | `/api/v1/paciente/citas` | Cookie `access_token` o Bearer |

Filtros opcionales de citas: `medicoId`, `especialidadId`, `fecha`
(`YYYY-MM-DD`).
