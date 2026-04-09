export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  slug: string;
  imagen_url?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'DESCONTINUADO';
  orden_visualizacion: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  creado_por: string;
}
