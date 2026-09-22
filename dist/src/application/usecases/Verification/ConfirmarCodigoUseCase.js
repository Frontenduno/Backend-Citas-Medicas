"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmarCodigoUseCase = void 0;
const CorreoRegistradoException_1 = require("../../exception/CorreoRegistradoException");
const CorreoYaVerificadoException_1 = require("../../exception/CorreoYaVerificadoException");
const CodigoExpiradoException_1 = require("../../exception/CodigoExpiradoException");
const DemasiadosIntentosException_1 = require("../../exception/DemasiadosIntentosException");
const CodigoIncorrectoException_1 = require("../../exception/CodigoIncorrectoException");
const ValidacionException_1 = require("../../exception/ValidacionException");
const CodigoVerificacion_1 = require("../../../domain/entity/CodigoVerificacion");
class ConfirmarCodigoUseCase {
    constructor(usuarioRepo, codigoRepo, codeGenerator, transactionManager, bcryptHasher, logger, metrics) {
        this.usuarioRepo = usuarioRepo;
        this.codigoRepo = codigoRepo;
        this.codeGenerator = codeGenerator;
        this.transactionManager = transactionManager;
        this.bcryptHasher = bcryptHasher;
        this.logger = logger;
        this.metrics = metrics;
    }
    async execute(input) {
        const tiempoInicio = Date.now();
        // Normalización y Sanitización
        const correoNormalizado = input.correo.trim().toLowerCase();
        const codigo = input.codigo.trim();
        const { contrasena, confirmarContrasena } = input;
        const emailOfuscado = correoNormalizado.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => {
            return gp2 + '*'.repeat(gp3.length);
        });
        this.logger.info(`Iniciando confirmación de código para ${emailOfuscado}`);
        if (!/^\d{6}$/.test(codigo)) {
            throw new ValidacionException_1.ValidacionException('El código debe contener exactamente 6 dígitos numéricos');
        }
        if (contrasena.length < 8) {
            throw new ValidacionException_1.ValidacionException('La contraseña debe tener al menos 8 caracteres');
        }
        if (contrasena !== confirmarContrasena) {
            throw new ValidacionException_1.ValidacionException('Las contraseñas no coinciden');
        }
        const usuario = await this.usuarioRepo.findByEmail(correoNormalizado);
        if (!usuario || !usuario.idUsuario) {
            this.metrics.incrementar('verificacion.fallida', { motivo: 'usuario_no_encontrado' });
            throw new CorreoRegistradoException_1.CorreoRegistradoException();
        }
        if (usuario.correoVerificado) {
            this.metrics.incrementar('verificacion.fallida', { motivo: 'correo_ya_verificado' });
            throw new CorreoYaVerificadoException_1.CorreoYaVerificadoException();
        }
        const codigoPendiente = await this.codigoRepo.buscarUltimoPendiente(usuario.idUsuario, 'REGISTRO');
        if (!codigoPendiente) {
            this.metrics.incrementar('verificacion.fallida', { motivo: 'sin_codigo_pendiente' });
            throw new CodigoExpiradoException_1.CodigoExpiradoException('No hay códigos pendientes');
        }
        if (codigoPendiente.estaExpirado()) {
            const codigoExpirado = new CodigoVerificacion_1.CodigoVerificacion(codigoPendiente.idCodigo ?? null, codigoPendiente.usuarioId, codigoPendiente.tipo, codigoPendiente.codigoHash, 'EXPIRADO', codigoPendiente.intentos, codigoPendiente.maxIntentos, codigoPendiente.expiraEn, codigoPendiente.ipSolicitud, codigoPendiente.userAgent, codigoPendiente.fechaCreacion, codigoPendiente.fechaUso);
            await this.codigoRepo.actualizar(codigoExpirado);
            this.metrics.incrementar('verificacion.fallida', { motivo: 'codigo_expirado' });
            throw new CodigoExpiradoException_1.CodigoExpiradoException();
        }
        if (codigoPendiente.intentos >= codigoPendiente.maxIntentos) {
            this.metrics.incrementar('verificacion.fallida', { motivo: 'max_intentos' });
            throw new DemasiadosIntentosException_1.DemasiadosIntentosException();
        }
        const hashGenerado = this.codeGenerator.hashear(codigo);
        if (hashGenerado !== codigoPendiente.codigoHash) {
            const nuevosIntentos = codigoPendiente.intentos + 1;
            const estadoNuevo = nuevosIntentos >= codigoPendiente.maxIntentos ? 'BLOQUEADO' : 'PENDIENTE';
            const codigoActualizado = new CodigoVerificacion_1.CodigoVerificacion(codigoPendiente.idCodigo ?? null, codigoPendiente.usuarioId, codigoPendiente.tipo, codigoPendiente.codigoHash, estadoNuevo, nuevosIntentos, codigoPendiente.maxIntentos, codigoPendiente.expiraEn, codigoPendiente.ipSolicitud, codigoPendiente.userAgent, codigoPendiente.fechaCreacion, codigoPendiente.fechaUso);
            await this.codigoRepo.actualizar(codigoActualizado);
            this.metrics.incrementar('verificacion.fallida', { motivo: 'codigo_incorrecto' });
            throw new CodigoIncorrectoException_1.CodigoIncorrectoException(`Código incorrecto. Intentos restantes: ${codigoActualizado.intentosRestantes()}`);
        }
        // Código válido, procedemos con la transacción
        await this.transactionManager.withTransaction(async (connection) => {
            const codigoUsado = new CodigoVerificacion_1.CodigoVerificacion(codigoPendiente.idCodigo ?? null, codigoPendiente.usuarioId, codigoPendiente.tipo, codigoPendiente.codigoHash, 'USADO', codigoPendiente.intentos, codigoPendiente.maxIntentos, codigoPendiente.expiraEn, codigoPendiente.ipSolicitud, codigoPendiente.userAgent, codigoPendiente.fechaCreacion, new Date());
            await this.codigoRepo.actualizar(codigoUsado, connection);
            const contrasenaHasheada = await this.bcryptHasher.encriptarContrasena(contrasena);
            usuario.contrasena = contrasenaHasheada;
            usuario.marcarCorreoComoVerificado();
            await this.usuarioRepo.guardar(usuario, connection);
        });
        this.logger.info(`Correo verificado exitosamente para ${emailOfuscado}`, { usuarioId: usuario.idUsuario });
        this.metrics.incrementar('verificacion.confirmada');
        this.metrics.observar('verificacion.tiempo_confirmacion_segundos', (Date.now() - tiempoInicio) / 1000);
    }
}
exports.ConfirmarCodigoUseCase = ConfirmarCodigoUseCase;
