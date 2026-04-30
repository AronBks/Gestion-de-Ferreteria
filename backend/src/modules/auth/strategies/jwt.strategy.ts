import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usuariosService: UsuariosService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'secret-key';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const user = await this.usuariosService.findById(payload.id);
    
    if (!user || user.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Sesión inválida o cuenta suspendida');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };
  }
}
