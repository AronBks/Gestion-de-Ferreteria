import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto, UpdateProductoDto } from './dto';
import { CategoriasService } from '../categorias/categorias.service';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    private categoriasService: CategoriasService,
  ) {}

  async create(
    createProductoDto: CreateProductoDto,
    usuarioId: string,
  ): Promise<Producto> {
    const { precio_costo, precio_venta, categoria_id } = createProductoDto;
    
    // ✅ VALIDACIÓN 1: categoria_id debe ser válido
    if (!categoria_id || categoria_id.trim() === '') {
      throw new BadRequestException(
        'categoria_id es requerido y no puede estar vacío',
      );
    }

    // ✅ VALIDACIÓN 2: La categoría debe existir
    const categoria = await this.categoriasService.findOne(categoria_id);
    if (!categoria) {
      throw new NotFoundException(
        `Categoría con ID ${categoria_id} no encontrada`,
      );
    }

    // ✅ VALIDACIÓN 3: precio_venta debe ser >= precio_costo
    if (precio_venta < precio_costo) {
      throw new BadRequestException(
        `El precio de venta (${precio_venta}) no puede ser menor que el precio de costo (${precio_costo})`,
      );
    }

    const margen_ganancia =
      precio_costo > 0 ? ((precio_venta - precio_costo) / precio_costo) * 100 : 0;

    const producto = this.productosRepository.create({
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

    const query = this.productosRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.categoria', 'categoria');

    // Aplicar filtros
    if (buscar) {
      query.where('p.nombre ILIKE :buscar OR p.codigo_producto ILIKE :buscar', { buscar: `%${buscar}%` });
    }

    if (estado) {
      query.andWhere('p.estado = :estado', { estado });
    }

    // Contar total antes de paginar
    const total = await query.getCount();

    // Aplicar paginación y ordenamiento
    const data = await query
      .orderBy('p.nombre', 'ASC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string | number): Promise<Producto> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const producto = await this.productosRepository.findOne({
      where: { id: numericId },
      relations: ['categoria'],
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(
    id: string | number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    // Obtener el producto actual
    const producto = await this.productosRepository.findOne({
      where: { id: numericId },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Obtener los precios a usar (nuevos o actuales)
    const precio_costo = updateProductoDto.precio_costo ?? producto.precio_costo;
    const precio_venta = updateProductoDto.precio_venta ?? producto.precio_venta;

    // ✅ VALIDACIÓN CRÍTICA: precio_venta debe ser >= precio_costo
    if (precio_venta < precio_costo) {
      throw new BadRequestException(
        `El precio de venta (${precio_venta}) no puede ser menor que el precio de costo (${precio_costo})`,
      );
    }

    // Asignar nuevos valores al objeto
    Object.assign(producto, updateProductoDto);

    // Recalcular margen si se modifican precios
    if (updateProductoDto.precio_costo !== undefined || updateProductoDto.precio_venta !== undefined) {
      producto.margen_ganancia = precio_costo > 0 ? ((precio_venta - precio_costo) / precio_costo) * 100 : 0;
    }

    // Guardar directamente con save() (más confiable que update())
    const productoGuardado = await this.productosRepository.save(producto);

    return productoGuardado;
  }

  async remove(id: string | number): Promise<{ mensaje: string }> {
    const producto = await this.findOne(id);
    await this.productosRepository.remove(producto);

    return { mensaje: `Producto ${producto.nombre} eliminado correctamente` };
  }

  async actualizarStock(
    id: string | number,
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
