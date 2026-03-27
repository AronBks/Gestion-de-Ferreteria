import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return await this.usuariosRepository.find();
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuariosRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Usuario | null> {
    return await this.usuariosRepository.findOne({ where: { id } });
  }
}
