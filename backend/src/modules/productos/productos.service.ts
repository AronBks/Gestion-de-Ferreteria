import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto, UpdateProductoDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async create(
    createProductoDto: CreateProductoDto,
    usuarioId: string,
  ): Promise<Producto> {
    const { precio_costo, precio_venta } = createProductoDto;
    const margen_ganancia =
      precio_costo > 0 ? ((precio_venta - precio_costo) / precio_costo) * 100 : 0;

    const producto = this.productosRepository.create({
      id: uuidv4(),
      ...createProductoDto,
      margen_ganancia,
      estado: 'ACTIVO',
      creado_por: usuarioId,
    });

    return await this.productosRepository.save(producto);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    buscar?: string,
    estado?: string,
  ): Promise<{
    data: Producto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    if (buscar) {
      whereConditions.nombre = ILike(`%${buscar}%`);
    }

    if (estado) {
      whereConditions.estado = estado;
    }

    const [data, total] = await this.productosRepository.findAndCount({
      where: whereConditions,
      order: { nombre: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(
    id: string,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);

    Object.assign(producto, updateProductoDto);
    return await this.productosRepository.save(producto);
  }

  async remove(id: string): Promise<{ mensaje: string }> {
    const producto = await this.findOne(id);
    await this.productosRepository.remove(producto);

    return { mensaje: `Producto ${producto.nombre} eliminado correctamente` };
  }

  async actualizarStock(
    id: string,
    cantidad: number,
    tipo: 'venta' | 'devolucion' | 'compra',
  ): Promise<Producto> {
    const producto = await this.findOne(id);

    let nuevoStock = producto.stock_actual;

    if (tipo === 'venta') {
      nuevoStock -= cantidad;
      if (nuevoStock < 0) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${producto.stock_actual}`,
        );
      }
    } else if (tipo === 'devolucion' || tipo === 'compra') {
      nuevoStock += cantidad;
    }

    producto.stock_actual = nuevoStock;
    return await this.productosRepository.save(producto);
  }
}
