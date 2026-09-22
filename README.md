# Backend Citas Médicas J&P Medic

## Instalación y Ejecución

```bash
npm install
npm run build
npm start
```

## Pruebas

Para ejecutar las pruebas unitarias:
```bash
npm test
```

## Base de Datos (Migraciones)

El sistema utiliza archivos SQL directos. Para configurar la BD:
1. Crea la base de datos `Sistema_Medico_JYP`
2. Ejecuta los scripts en orden desde `migrations/`

## Configuración del Email

El sistema de verificación soporta SMTP y SendGrid. Configura las variables en el `.env` guiándote del archivo `.env.example`.
Para desarrollo, puedes usar Gmail con "Contraseña de aplicación" ajustando:
```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=xxxx_xxxx_xxxx_xxxx
```
