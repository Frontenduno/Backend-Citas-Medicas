import { CorreoRegistradoException } from '../../exception/CorreoRegistradoException';
import { CorreoYaVerificadoException } from '../../exception/CorreoYaVerificadoException';
import { DemasiadosIntentosException } from '../../exception/DemasiadosIntentosException';
import { DemasiadasSolicitudesException } from '../../exception/DemasiadasSolicitudesException';
import { ValidacionException } from '../../exception/ValidacionException';
import { CodeGenerator } from '../../ports/CodeGenerator';
import { CodigoVerificacionRepository } from '../../ports/CodigoVerificacionRepository';
import { EmailSender } from '../../ports/EmailSender';
import { Logger } from '../../ports/Logger';
import { Metrics } from '../../ports/Metrics';
import { IUsuarioRepository } from '../../../domain/repository/UsuarioRepository';
import { CodigoVerificacion } from '../../../domain/entity/CodigoVerificacion';

interface Input {
  correo: string;
  ip: string | null;
  userAgent: string | null;
}

export class SolicitarCodigoUseCase {
  constructor(
    private usuarioRepo: IUsuarioRepository,
    private codigoRepo: CodigoVerificacionRepository,
    private codeGenerator: CodeGenerator,
    private emailSender: EmailSender,
    private logger: Logger,
    private metrics: Metrics
  ) {}

  async execute(input: Input): Promise<void> {
    // Normalización y Sanitización
    const correoNormalizado = input.correo.trim().toLowerCase();
    const ipSanitizada = input.ip ? input.ip.substring(0, 45) : null;
    const userAgentSanitizado = input.userAgent ? input.userAgent.substring(0, 255) : null;
    
    const emailOfuscado = (() => {
      const [local, dominio] = correoNormalizado.split('@');
      if (local.length <= 2) return correoNormalizado; // no obfuscation needed
      const visible = local.slice(0, 2);
      const obscured = '*'.repeat(local.length - 2);
      return `${visible}${obscured}@${dominio}`;
    })();

    this.logger.info(`Iniciando solicitud de código para ${emailOfuscado}`, { ip: ipSanitizada });

    // Validar formato correo y longitud
    if (correoNormalizado.length > 255) {
      throw new ValidacionException('El correo es demasiado largo');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNormalizado)) {
      throw new ValidacionException('Formato de correo inválido');
    }

    // Rate Limit por IP: Máx 3 solicitudes en 10 min, Máx 10 en 1 hora
    if (ipSanitizada) {
      const solicitudesUltimos10Min = await this.codigoRepo.contarPorIp(ipSanitizada, 600);
      if (solicitudesUltimos10Min >= 3) {
        this.logger.warn(`Rate limit excedido por IP (10m) para ${ipSanitizada}`);
        this.metrics.incrementar('verificacion.fallida');
        throw new DemasiadasSolicitudesException('Demasiadas solicitudes desde esta IP. Intenta en 10 minutos.');
      }
      
      const solicitudesUltimaHora = await this.codigoRepo.contarPorIp(ipSanitizada, 3600);
      if (solicitudesUltimaHora >= 10) {
        this.logger.warn(`Rate limit excedido por IP (1h) para ${ipSanitizada}`);
        throw new DemasiadasSolicitudesException('Demasiadas solicitudes desde esta IP. Intenta más tarde.');
      }
    }

    const usuario = await this.usuarioRepo.findByEmail(correoNormalizado);
    if (!usuario || !usuario.idUsuario) {
      this.logger.warn(`Solicitud fallida: Usuario no encontrado para ${emailOfuscado}`);
      throw new CorreoRegistradoException();
    }

    if (usuario.correoVerificado) {
      this.logger.warn(`Solicitud fallida: Correo ya verificado para ${emailOfuscado}`);
      throw new CorreoYaVerificadoException();
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
      throw new DemasiadosIntentosException('Debes esperar 60 segundos antes de solicitar otro código');
    }

    await this.codigoRepo.invalidarPendientes(usuario.idUsuario, 'REGISTRO');

    const { codigo, codigoHash } = this.codeGenerator.generar();
    
    const expiraEn = new Date();
    expiraEn.setMinutes(expiraEn.getMinutes() + 15); // Expiración 15 mins

    const nuevoCodigo = new CodigoVerificacion(
      null,
      usuario.idUsuario,
      'REGISTRO',
      codigoHash,
      'PENDIENTE',
      0,
      5,
      expiraEn,
      ipSanitizada,
      userAgentSanitizado,
      new Date(),
      null
    );

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
