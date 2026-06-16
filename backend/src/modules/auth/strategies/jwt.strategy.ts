import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JwtStrategy — Valida y decodifica el JWT en cada request autenticado.
 *
 * OPTIMIZACIÓN DE RENDIMIENTO:
 * ─────────────────────────────
 * ANTES:  Cada request hacía una consulta a la BD (findById) para verificar
 *         el usuario, causando N consultas innecesarias por sesión.
 *
 * AHORA:  El payload del JWT ya contiene id, email, nombre y rol.
 *         Passport verifica automáticamente la firma y expiración del token.
 *         Solo retornamos el payload decodificado sin tocar la BD.
 *
 * SEGURIDAD:
 * ─────────
 * - La firma del JWT garantiza que los datos no fueron alterados.
 * - La expiración (2h) limita la ventana de acceso si un usuario es suspendido.
 * - Si se necesita invalidación inmediata en el futuro, implementar blacklist Redis.
 *
 * TRADE-OFF DOCUMENTADO:
 * Si un admin suspende a un usuario, este mantiene acceso hasta que expire
 * el JWT (máximo 2 horas con la configuración actual). Esto es aceptable
 * para el volumen de operación de una ferretería y evita la complejidad
 * de una infraestructura Redis.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || 'secret-key';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Passport llama a validate() DESPUÉS de verificar la firma y expiración.
   * Si llegamos aquí, el token es legítimo y vigente.
   *
   * @param payload — Datos decodificados del JWT { id, email, nombre, rol }
   * @returns El objeto usuario que se inyecta en req.user
   */
  async validate(payload: any) {
    // Validar que el payload tenga la estructura esperada
    if (!payload.id || !payload.rol) {
      throw new UnauthorizedException(
        'Token con estructura inválida. Inicie sesión nuevamente.',
      );
    }

    // Retornar directamente el payload → CERO consultas a BD
    return {
      id: payload.id,
      email: payload.email,
      nombre: payload.nombre,
      rol: payload.rol,
    };
  }
}
