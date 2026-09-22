# ADR 001: Arquitectura del Sistema de Verificación de Correo (OTP)

## Estado
Aceptado

## Contexto
Se requiere verificar el correo de los pacientes mediante un código de 6 dígitos enviado a su email. Es un punto crítico sujeto a vulnerabilidades como spam, brute force, y saturación de APIs de envío.

## Decisiones

1. **Tabla Independiente:** `VerificacionCorreo` con Foreign Key a `Usuario`. No ensuciar la tabla `Usuario` con campos de OTP efímeros.
2. **Hasheo de OTP:** Se guarda un hash SHA-256 del código en la BD, NUNCA en texto plano, protegiendo contra filtraciones.
3. **Factory para EmailSender:** Invertir la dependencia. `EmailSenderFactory` decide entre `SMTP` y `SendGrid` en base a variables de entorno (`EMAIL_PROVIDER`). Evita acoplamiento con Nodemailer/Gmail.
4. **Idempotencia y Rate Limiting:** Implementado en UseCases validando IP y tiempos para evitar abusos o envíos duplicados accidentales.
5. **Observabilidad:** Inyección de `Logger` (Winston) y `Metrics` permitiendo recolectar datos de éxito/fallo sin acoplar los Casos de Uso a librerías de consola.

## Consecuencias
- Mayor complejidad inicial y más archivos (Clean Architecture).
- Capacidad de escalar o cambiar a SendGrid en 1 minuto (solo con `.env`).
- Resiliencia frente a ataques de fuerza bruta al endpoint de registro.

