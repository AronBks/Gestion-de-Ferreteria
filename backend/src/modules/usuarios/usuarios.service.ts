import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, UserStatus } from './usuario.entity';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async findAll(rol?: string, estado?: string): Promise<Usuario[]> {
    const query = this.usuariosRepository.createQueryBuilder('usuario').where('usuario.activo = :activo', { activo: true });
    if (rol) query.andWhere('usuario.rol = :rol', { rol });
    if (estado) query.andWhere('usuario.estado = :estado', { estado });
    return await query.getMany();
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuariosRepository.createQueryBuilder('usuario').addSelect('usuario.password').where('usuario.email = :email', { email }).getOne();
  }

  async findById(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({ where: { id, activo: true } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async create(createUsuarioDto: CreateUsuarioDto, adminId: string): Promise<any> {
    const exists = await this.usuariosRepository.findOne({ where: [ { email: createUsuarioDto.email }, { numeroDocumento: createUsuarioDto.numeroDocumento } ] });
    if (exists) throw new BadRequestException('El usuario con ese email o documento ya existe');
    const tmpPassword = createUsuarioDto.password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tmpPassword, 12);
    const newUsuario = this.usuariosRepository.create({ ...createUsuarioDto, password: hashedPassword, creadoPor: adminId });
    await this.usuariosRepository.save(newUsuario);
    delete (newUsuario as any).password;
    return newUsuario;
  }

  async update(id: string, updateDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findById(id);
    Object.assign(usuario, updateDto);
    if (updateDto.password) {
      usuario.password = await bcrypt.hash(updateDto.password, 12);
    }
    return await this.usuariosRepository.save(usuario);
  }

  async updateEstado(id: string, estado: UserStatus): Promise<Usuario> {
    const usuario = await this.findById(id);
    usuario.estado = estado;
    return await this.usuariosRepository.save(usuario);
  }

  async resetPassword(id: string): Promise<{ temporal: string }> {
    const usuario = await this.findById(id);
    const tmpPassword = Math.random().toString(36).slice(-8);
    usuario.password = await bcrypt.hash(tmpPassword, 12);
    await this.usuariosRepository.save(usuario);
    return { temporal: tmpPassword };
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.findById(id);
    usuario.activo = false;
    usuario.estado = UserStatus.INACTIVO;
    await this.usuariosRepository.save(usuario);
  }
}
