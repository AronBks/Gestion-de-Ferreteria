import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return await this.categoriasRepository.find({
      where: { estado: 'ACTIVO' },
      order: { orden_visualizacion: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Categoria | null> {
    return await this.categoriasRepository.findOne({
      where: { id },
    });
  }

  async getCategoriaDefaultId(): Promise<string | undefined> {
    // Obtiene la primera categoría activa
    const categoria = await this.categoriasRepository.findOne({
      where: { estado: 'ACTIVO' },
      order: { orden_visualizacion: 'ASC' },
    });
    return categoria?.id;
  }
}
