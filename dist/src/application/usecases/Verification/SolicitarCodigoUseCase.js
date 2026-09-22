"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitarCodigoUseCase = void 0;
const CorreoRegistradoException_1 = require("../../exception/CorreoRegistradoException");
const CorreoYaVerificadoException_1 = require("../../exception/CorreoYaVerificadoException");
const DemasiadosIntentosException_1 = require("../../exception/DemasiadosIntentosException");
const DemasiadasSolicitudesException_1 = require("../../exception/DemasiadasSolicitudesException");
const ValidacionException_1 = require("../../exception/ValidacionException");
const CodigoVerificacion_1 = require("../../../domain/entity/CodigoVerificacion");
class SolicitarCodigoUseCase {
    constructor(usuarioRepo, codigoRepo, codeGenerator, emailSender, logger, metrics) {
        this.usuarioRepo = usuarioRepo;
        this.codigoRepo = codigoRepo;
        this.codeGenerator = codeGenerator;
        this.emailSender = emailSender;
        this.logger = logger;
        this.metrics = metrics;
    }
    async execute(input) {
        // Normalización y Sanitización
        const correoNormalizado = input.correo.trim().toLowerCase();
        const ipSanitizada = input.ip ? input.ip.substring(0, 45) : null;
        const userAgentSanitizado = input.userAgent ? input.userAgent.substring(0, 255) : null;
        const emailOfuscado = correoNormalizado.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => {
            return gp2 + '*'.repeat(gp3.length);
        });
        this.logger.info(`Iniciando solicitud de código para ${emailOfuscado}`, { ip: ipSanitizada });
        // Validar formato correo y longitud
        if (correoNormalizado.length > 255) {
            throw new ValidacionException_1.ValidacionException('El correo es demasiado largo');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correoNormalizado)) {
            throw new ValidacionException_1.ValidacionException('Formato de correo inválido');
        }
        // Rate Limit por IP: Máx 3 solicitudes en 10 min, Máx 10 en 1 hora
        if (ipSanitizada) {
            const solicitudesUltimos10Min = await this.codigoRepo.contarPorIp(ipSanitizada, 600);
            if (solicitudesUltimos10Min >= 3) {
                this.logger.warn(`Rate limit excedido por IP (10m) para ${ipSanitizada}`);
                throw new DemasiadasSolicitudesException_1.DemasiadasSolicitudesException('Demasiadas solicitudes desde esta IP. Intenta en 10 minutos.');
            }
            const solicitudesUltimaHora = await this.codigoRepo.contarPorIp(ipSanitizada, 3600);
            if (solicitudesUltimaHora >= 10) {
                this.logger.warn(`Rate limit excedido por IP (1h) para ${ipSanitizada}`);
                throw new DemasiadasSolicitudesException_1.DemasiadasSolicitudesException('Demasiadas solicitudes desde esta IP. Intenta más tarde.');
            }
        }
        const usuario = await this.usuarioRepo.findByEmail(correoNormalizado);
        if (!usuario || !usuario.idUsuario) {
            this.logger.warn(`Solicitud fallida: Usuario no encontrado para ${emailOfuscado}`);
            throw new CorreoRegistradoException_1.CorreoRegistradoException();
        }
        if (usuario.correoVerificado) {
            this.logger.warn(`Solicitud fallida: Correo ya verificado para ${emailOfuscado}`);
            throw new CorreoYaVerificadoException_1.CorreoYaVerificadoException();
        }
        // Idempotencia: Si hay un código reciente (<30s), reutilizarlo
        const codigoPendiente = await this.codigoRepo.buscarUltimoPendiente(usuario.idUsuario, 'REGISTRO');
        if (codigoPendiente && !codigoPendiente.estaExpirado()) {
            const segundosDesdeCreacion = (new Date().getTime() - codigoPendiente.fechaCreacion.getTime()) / 1000;
            if (segundosDesdeCreacion < 30) {
                this.logger.info(`Idempotencia: Reutilizando código reciente para ${emailOfuscado}`);
                // Retornamos OK sin generar ni enviar nada nuevo para evitar spam
                return;
            }
        }
        const intentosRecientes = await this.codigoRepo.contarRecientes(usuario.idUsuario, 'REGISTRO', 60);
        if (intentosRecientes > 0) {
            throw new DemasiadosIntentosException_1.DemasiadosIntentosException('Debes esperar 60 segundos antes de solicitar otro código');
        }
        await this.codigoRepo.invalidarPendientes(usuario.idUsuario, 'REGISTRO');
        const { codigo, codigoHash } = this.codeGenerator.generar();
        const expiraEn = new Date();
        expiraEn.setMinutes(expiraEn.getMinutes() + 15); // Expiración 15 mins
        const nuevoCodigo = new CodigoVerificacion_1.CodigoVerificacion(null, usuario.idUsuario, 'REGISTRO', codigoHash, 'PENDIENTE', 0, 5, expiraEn, ipSanitizada, userAgentSanitizado, new Date(), null);
        await this.codigoRepo.crear(nuevoCodigo);
        await this.emailSender.enviarCodigoVerificacion({
            destinatario: correoNormalizado,
            nombre: usuario.nombres,
            codigo
        });
        this.logger.info(`Código solicitado exitosamente para ${emailOfuscado}`);
        this.metrics.incrementar('verificacion.solicitada');
    }
}
exports.SolicitarCodigoUseCase = SolicitarCodigoUseCase;
