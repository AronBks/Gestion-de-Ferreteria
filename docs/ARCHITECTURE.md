# 🏗️ ARQUITECTURA DEL SISTEMA - FERRETERIA POS

## 📑 Índice
1. [Visión Arquitectónica](#visión-arquitectónica)
2. [Principios de Diseño](#principios-de-diseño)
3. [Capas de Arquitectura](#capas-de-arquitectura)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Acceso a Datos](#acceso-a-datos)
6. [Seguridad](#seguridad)
7. [Performance](#performance)
8. [Escalabilidad](#escalabilidad)

---

## 🎯 Visión Arquitectónica

### Objetivo Principal
Crear un sistema modular, escalable y fácil de mantener que pueda crecer con el negocio de la ferretería, permitiendo agregar funcionalidades sin afectar módulos existentes.

### Características Clave
- ✅ **Modularidad**: Independencia entre módulos
- ✅ **Escalabilidad Horizontal**: Múltiples instancias en paralelo
- ✅ **Bajo Acoplamiento**: Mínimas dependencias entre componentes
- ✅ **Alta Cohesión**: Funcionalidades relacionadas agrupadas
- ✅ **Testabilidad**: Fácil de probar cada componente
- ✅ **Mantenibilidad**: Código limpio y documentado

---

## 💡 Principios de Diseño

### 1. SOLID

#### Single Responsibility Principle (SRP)
```typescript
// ❌ MAL - La clase hace demasiado
class VentasService {
  async crearVenta() { /* venta */ }
  async enviarEmail() { /* envío */ }
  async generarReporte() { /* reporte */ }
  async actualizarInventario() { /* inventario */ }
}

// ✅ BIEN - Cada clase tiene una responsabilidad
class VentasService {
  async crearVenta() { /* venta */ }
}

class NotificacionesService {
  async enviarEmail() { /* envío */ }
}

class ReportesService {
  async generarReporte() { /* reporte */ }
}

class InventarioService {
  async actualizarInventario() { /* inventario */ }
}
```

#### Open/Closed Principle (OCP)
```typescript
// ❌ MAL - Modificar la clase existente
class ReporteGenerator {
  generate(tipo: string) {
    if (tipo === 'PDF') { /* PDF */ }
    if (tipo === 'EXCEL') { /* EXCEL */ }
    // Agregar nuevo formato requiere cambiar la clase
  }
}

// ✅ BIEN - Exicaión abierta para extensión
interface ReporteStrategy {
  generate(data: any): Promise<Buffer>;
}

class PDFReporte implements ReporteStrategy {
  generate(data: any): Promise<Buffer> { /* PDF */ }
}

class ExcelReporte implements ReporteStrategy {
  generate(data: any): Promise<Buffer> { /* EXCEL */ }
}

class ReporteGenerator {
  constructor(private strategy: ReporteStrategy) {}
  generate(data: any) {
    return this.strategy.generate(data);
  }
}
```

#### Liskov Substitution Principle (LSP)
```typescript
// Cualquier clase que implemente una interfaz debe poderse usar
// en lugar de otra sin romper la funcionalidad

interface Pageable {
  pay(monto: number): Promise<boolean>;
}

class PagoEfectivo implements Pageable {
  pay(monto: number): Promise<boolean> { /* ... */ }
}

class PagoTarjeta implements Pageable {
  pay(monto: number): Promise<boolean> { /* ... */ }
}

// Ambos pueden usarse de la misma forma
const procesarPago = (pageable: Pageable) => pageable.pay(100);
```

#### Interface Segregation Principle (ISP)
```typescript
// ❌ MAL - Una interfaz grande que hace de todo
interface Usuario {
  crear(): void;
  actualizar(): void;
  obtener(): void;
  eliminar(): void;
  asignarRol(): void;
  generarReporte(): void;
  enviarEmail(): void;
}

// ✅ BIEN - Interfaces específicas
interface Repositorio<T> {
  crear(entidad: T): Promise<T>;
  actualizar(id: string, entidad: Partial<T>): Promise<T>;
  obtener(id: string): Promise<T>;
  eliminar(id: string): Promise<boolean>;
}

interface GestorRoles {
  asignarRol(usuarioId: string, rolId: string): Promise<void>;
}

interface GeneradorReportes {
  generarReporte(tipo: string): Promise<Buffer>;
}
```

#### Dependency Inversion Principle (DIP)
```typescript
// ❌ MAL - Dependencia directa de la implementación
class VentasService {
  constructor() {
    this.db = new PostgreSQLConnection();
  }
}

// ✅ BIEN - Dependencia de abstracción (interfaz)
interface DataSource {
  query(sql: string): Promise<any>;
}

@Injectable()
class VentasService {
  constructor(
    @Inject('DataSource')
    private dataSource: DataSource
  ) {}
}
```

### 2. DRY (Don't Repeat Yourself)
```typescript
// ✅ Crear base classes reutilizables
abstract class BaseService<T> {
  constructor(private repository: Repository<T>) {}
  
  async obtenerTodos(): Promise<T[]> {
    return this.repository.find();
  }
  
  async obtenerPorId(id: string): Promise<T> {
    return this.repository.findOne(id);
  }
}

@Injectable()
class ProductosService extends BaseService<Producto> {
  // Heredar métodos comunes
  // Agregar lógica específica de productos
}
```

### 3. KISS (Keep It Simple, Stupid)
```typescript
// ❌ Sobre-complicado
class VentasService {
  private cache = {};
  private subscribers = [];
  private eventBus = new EventBus();
  
  async crearVenta(...) {
    // 100 líneas de lógica compleja
  }
}

// ✅ Simple y claro
@Injectable()
class VentasService {
  constructor(
    private ventasRepository: VentasRepository,
    private productosService: ProductosService,
    private cajaService: CajaService
  ) {}
  
  async crearVenta(dto: CreateVentaDto): Promise<Venta> {
    // Lógica clara y directa
  }
}
```

---

## 🏛️ Capas de Arquitectura

### Arquitectura en Capas

```
┌─────────────────────────────────────────┐
│  PRESENTATION LAYER (Controllers)      │
│  - Maneja peticiones HTTP               │
│  - Validación de inputs                 │
│  - Serialización de responses           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  APPLICATION LAYER (Services)          │
│  - Lógica de negocio                    │
│  - Coordinación de operaciones          │
│  - Transformación de datos              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  DOMAIN LAYER (Entities/Value Objects)│
│  - Reglas de negocio puras             │
│  - Validaciones de dominio              │
│  - Agregados                            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ INFRASTRUCTURE LAYER (Repositories) │
│  - Acceso a datos                       │
│  - Persistencia                         │
│  - Integraciones externas               │
└─────────────────────────────────────────┘
```

### Ejemplo Práctico

```typescript
// 1. DOMAIN LAYER - Entidad Pura
export class Venta {
  id: string;
  numero: string;
  items: VentaItem[];
  total: number;
  
  constructor(numero: string) {
    this.numero = numero;
    this.items = [];
    this.total = 0;
  }
  
  agregarItem(item: VentaItem): void {
    if (!item || item.cantidad <= 0) {
      throw new Error('Item inválido');
    }
    this.items.push(item);
    this.recalcularTotal();
  }
  
  private recalcularTotal(): void {
    this.total = this.items.reduce(
      (sum, item) => sum + (item.precio * item.cantidad),
      0
    );
  }
}

// 2. REPOSITORY - Acceso a Datos
interface IVentasRepository {
  crear(venta: Venta): Promise<Venta>;
  obtenerPorId(id: string): Promise<Venta>;
}

@Injectable()
export class VentasRepository implements IVentasRepository {
  constructor(private db: DataSource) {}
  
  async crear(venta: Venta): Promise<Venta> {
    return this.db.save(venta);
  }
  
  async obtenerPorId(id: string): Promise<Venta> {
    return this.db.findOne(id);
  }
}

// 3. SERVICE LAYER - Lógica de Negocio
@Injectable()
export class VentasService {
  constructor(
    private ventasRepository: VentasRepository,
    private productosService: ProductosService,
    private notificacionesService: NotificacionesService
  ) {}
  
  async crearVenta(dto: CreateVentaDto): Promise<VentaDto> {
    // Validar productos existen y tienen stock
    const productos = await this.productosService
      .obtenerPorIds(dto.productosIds);
    
    // Crear entidad de dominio
    const venta = new Venta(this.generarNumero());
    
    // Agregar items
    for (const item of dto.items) {
      const producto = productos.find(p => p.id === item.productoId);
      venta.agregarItem(new VentaItem(producto, item.cantidad));
    }
    
    // Persistir
    const ventaGuardada = await this.ventasRepository.crear(venta);
    
    // Notificar
    await this.notificacionesService.notificarVenta(ventaGuardada);
    
    return this.mapToDto(ventaGuardada);
  }
}

// 4. CONTROLLER LAYER - Manejo HTTP
@Controller('ventas')
@UseGuards(JwtAuthGuard)
export class VentasController {
  constructor(private ventasService: VentasService) {}
  
  @Post()
  @UseGuards(RolesGuard)
  @Roles('VENDEDOR', 'GERENTE')
  async crear(@Body() dto: CreateVentaDto): Promise<VentaDto> {
    return this.ventasService.crearVenta(dto);
  }
}
```

---

## 🎨 Patrones de Diseño

### 1. Repository Pattern
```typescript
// Abstracción del acceso a datos
interface IRepository<T> {
  crear(entity: T): Promise<T>;
  obtenerTodos(): Promise<T[]>;
  obtenerPorId(id: string): Promise<T | null>;
  actualizar(id: string, entity: Partial<T>): Promise<T>;
  eliminar(id: string): Promise<boolean>;
}

@Injectable()
export class ProductosRepository implements IRepository<Producto> {
  constructor(
    @InjectRepository(Producto)
    private repo: Repository<Producto>
  ) {}
  
  async crear(producto: Producto): Promise<Producto> {
    return this.repo.save(producto);
  }
  
  // Implementar otros métodos...
}
```

### 2. Factory Pattern
```typescript
@Injectable()
export class PagoFactory {
  crear(metodo: PaymentMethod): Pagable {
    switch (metodo) {
      case 'EFECTIVO':
        return new PagoEfectivo();
      case 'TARJETA':
        return new PagoTarjeta();
      case 'TRANSFERENCIA':
        return new PagoTransferencia();
      default:
        throw new Error('Método no soportado');
    }
  }
}
```

### 3. Observer Pattern
```typescript
@Injectable()
export class EventoBus {
  private suscriptores: Map<string, Function[]> = new Map();
  
  suscribirse(evento: string, handler: Function): void {
    if (!this.suscriptores.has(evento)) {
      this.suscriptores.set(evento, []);
    }
    this.suscriptores.get(evento)!.push(handler);
  }
  
  emitir(evento: string, data: any): void {
    const handlers = this.suscriptores.get(evento) || [];
    handlers.forEach(handler => handler(data));
  }
}

// Uso
class VentasService {
  constructor(private eventoBus: EventoBus) {
    this.eventoBus.suscribirse('venta.creada', this.onVentaCreada);
  }
  
  async crearVenta(dto: CreateVentaDto) {
    const venta = await this.ventasRepository.crear(dto);
    this.eventoBus.emitir('venta.creada', venta);
  }
}
```

### 4. Strategy Pattern
```typescript
interface DescuentoStrategy {
  calcular(monto: number): number;
}

class DescuentoPorcentaje implements DescuentoStrategy {
  constructor(private porcentaje: number) {}
  
  calcular(monto: number): number {
    return monto * (this.porcentaje / 100);
  }
}

class DescuentoFijo implements DescuentoStrategy {
  constructor(private monto: number) {}
  
  calcular(monto: number): number {
    return Math.min(this.monto, monto);
  }
}

class Venta {
  aplicarDescuento(estrategia: DescuentoStrategy) {
    this.descuento = estrategia.calcular(this.subtotal);
  }
}
```

---

## 💾 Acceso a Datos

### TypeORM - ORM de Referencia

```typescript
// Entidad
@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({type: 'varchar', length: 255})
  nombre: string;
  
  @Column({type: 'decimal', precision: 12, scale: 2})
  precioVenta: number;
  
  @ManyToOne(() => Categoria, c => c.productos)
  @JoinColumn({name: 'categoria_id'})
  categoria: Categoria;
  
  @CreateDateColumn()
  fechaCreacion: Date;
  
  @UpdateDateColumn()
  fechaActualizacion: Date;
}

// Repositorio
@Injectable()
export class ProductosRepository {
  constructor(
    @InjectRepository(Producto)
    private repo: Repository<Producto>
  ) {}
  
  async obtenerActivos(): Promise<Producto[]> {
    return this.repo.find({
      where: { estado: 'ACTIVO' },
      relations: ['categoria'],
      order: { nombre: 'ASC' }
    });
  }
  
  async obtenerConStock(): Promise<Producto[]> {
    return this.repo
      .createQueryBuilder('p')
      .where('p.stock_actual > p.stock_minimo')
      .leftJoinAndSelect('p.categoria', 'c')
      .orderBy('p.nombre', 'ASC')
      .getMany();
  }
}
```

---

## 🔐 Seguridad

### Autenticación JWT

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}
  
  async login(email: string, password: string) {
    const usuario = await this.usuariosService.obtenerPorEmail(email);
    
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    const esValido = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };
    
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '1h'
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d'
      })
    };
  }
}
```

### Autorización por Roles

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );
    
    if (!rolesRequeridos) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;
    
    return rolesRequeridos.includes(usuario.rol);
  }
}

// Uso
@Roles('GERENTE', 'ADMIN')
@Post('reportes/cerrar-caja')
async cerrarCaja() { /* ... */ }
```

### Validación de DTOs

```typescript
export class CreateVentaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VentaItemDto)
  items: VentaItemDto[];
  
  @IsEnum(PaymentMethod)
  metodo_pago: PaymentMethod;
  
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class VentaItemDto {
  @IsUUID()
  producto_id: string;
  
  @IsInt()
  @Min(1)
  cantidad: number;
  
  @IsDecimal()
  precio_unitario: number;
}
```

---

## ⚡ Performance

### Caché

```typescript
@Injectable()
export class ProductosService {
  constructor(
    private repo: ProductosRepository,
    private cacheManager: Cache
  ) {}
  
  async obtenerTodos(): Promise<Producto[]> {
    const cached = await this.cacheManager.get('productos:todos');
    
    if (cached) {
      return cached;
    }
    
    const productos = await this.repo.obtenerActivos();
    await this.cacheManager.set('productos:todos', productos, 3600);
    
    return productos;
  }
  
  async invalidarCache(): Promise<void> {
    await this.cacheManager.del('productos:todos');
  }
}
```

### Query Optimization

```typescript
// ❌ N+1 Query Problem
async obtenerVentasConDetalles() {
  const ventas = await this.ventasRepo.obtenerTodas();
  
  for (const venta of ventas) {
    venta.detalles = await this.detallesRepo.obtenerPorVenta(venta.id);
    // Múltiples queries!
  }
}

// ✅ Eager Loading
async obtenerVentasConDetalles() {
  return this.ventasRepo.find({
    relations: ['detalles']  // Una sola query con JOIN
  });
}
```

---

## 📈 Escalabilidad

### Estrategia de Escalado Horizontal

```
┌─────────────────────────────────────────┐
│         NGINX Load Balancer             │
└──────────────────┬──────────────────────┘
        │          │          │
        ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │NestJS  │ │NestJS  │ │NestJS  │
    │Instance│ │Instance│ │Instance│
    │   #1   │ │   #2   │ │   #3   │
    └────────┘ └────────┘ └────────┘
        │          │          │
        └──────────┼──────────┘
                   │
            ┌──────▼──────┐
            │  PostgreSQL │
            │   (Primary) │
            └─────────────┘
```

### Sesiones Distribuidas

```typescript
// Usar Redis para sesiones compartidas
@Module({
  imports: [
    SessionModule.forRoot({
      store: new RedisStore({
        client: redisClient,
        prefix: 'session:'
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true
      }
    })
  ]
})
export class AppModule {}
```

---

## 📝 Conclusión

Esta arquitectura proporciona:
- ✅ **Mantenibilidad**: Código organizado y predecible
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
- ✅ **Testabilidad**: Componentes desacoplados
- ✅ **Performance**: Optimizaciones integradas
- ✅ **Seguridad**: Capas de protección

