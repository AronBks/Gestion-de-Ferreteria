import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto, UpdateUsuarioEstadoDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './usuario.entity';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Listar usuarios paginados o filtrados' })
  findAll(@Query('rol') rol: string, @Query('estado') estado: string) {
    return this.usuariosService.findAll(rol, estado);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Detalle de un usuario' })
  findOne(@Param('id') id: string) {
    return this.usuariosService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear usuario' })
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req) {
    if ((createUsuarioDto.rol === UserRole.ADMIN || createUsuarioDto.rol === UserRole.GERENTE) && req.user.rol !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo un ADMIN puede crear administradores o gerentes');
    }
    return this.usuariosService.create(createUsuarioDto, req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos de usuario' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    if (updateUsuarioDto.rol) {
      throw new ForbiddenException('Use el endpoint /roles para cambiar el rol');
    }
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/estado')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Suspender o activar usuario' })
  updateEstado(@Param('id') id: string, @Body() updateEstadoDto: UpdateUsuarioEstadoDto) {
    return this.usuariosService.updateEstado(id, updateEstadoDto.estado);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuario lógicamente' })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  @Post(':id/reset-password')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reiniciar clave a temporal' })
  resetPassword(@Param('id') id: string) {
    return this.usuariosService.resetPassword(id);
  }
}
