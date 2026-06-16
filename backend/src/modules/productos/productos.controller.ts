import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto, UpdateProductoDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../usuarios/usuario.entity';

/**
 * ProductosController — RBAC aplicado:
 *
 * GET  (lectura):  Todos los roles autenticados (catálogo es universal)
 * POST (crear):    ADMIN, GERENTE, ALMACENERO
 * PATCH (editar):  ADMIN, GERENTE, ALMACENERO
 * DELETE (borrar): Solo ADMIN
 *
 * VENDEDOR y AUDITOR: Solo lectura (pueden ver el catálogo pero no modificarlo)
 */
@ApiTags('Productos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('productos')
export class ProductosController {
  constructor(private productosService: ProductosService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar productos con filtros y paginación' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('buscar') buscar?: string,
    @Query('estado') estado?: string,
  ) {
    return await this.productosService.findAll(page, limit, buscar, estado);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detalle de un producto por ID' })
  async findOne(@Param('id') id: string) {
    return await this.productosService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.ALMACENERO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo producto' })
  async create(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    const usuarioId = req.user.sub || req.user.id;
    return await this.productosService.create(createProductoDto, usuarioId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.ALMACENERO)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar producto existente' })
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return await this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar producto (solo ADMIN)' })
  async remove(@Param('id') id: string) {
    return await this.productosService.remove(id);
  }
}
