import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { Categoria } from './categoria.entity';

@Controller('categorias')
export class CategoriasController {
  constructor(private categoriasService: CategoriasService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Categoria[]> {
    return await this.categoriasService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Categoria | null> {
    return await this.categoriasService.findOne(id);
  }
}
