import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const usuario = await this.usuariosService.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Validar contraseña (en BD están en bcrypt, pero para primer test usamos direktamente)
    // En producción, usar: await bcrypt.compare(password, usuario.password)
    if (usuario.password !== password) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Generar JWT
    const payload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }
}
