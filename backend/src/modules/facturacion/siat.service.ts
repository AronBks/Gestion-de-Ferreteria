import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';

// ============================================================================
// SiatService — Mock del Sistema Integrado de Administración Tributaria
// ============================================================================
// Este servicio simula las operaciones del SIAT de Bolivia.
// En producción, se reemplazarían los métodos mock por llamadas reales
// al Web Service SOAP/REST del SIAT (Impuestos Nacionales).
// ============================================================================

export interface SiatCufResponse {
  cuf: string;
  fechaGeneracion: Date;
}

export interface SiatCufdResponse {
  cufd: string;
  codigoControl: string;
  fechaVigencia: Date;
}

export interface SiatLeyendaResponse {
  leyenda: string;
  codigoLeyenda: number;
}

export interface SiatValidacionNitResponse {
  valido: boolean;
  razonSocial: string;
  mensaje: string;
}

@Injectable()
export class SiatService {
  private readonly logger = new Logger(SiatService.name);

  // Contador interno para número de factura (en producción viene del SIAT)
  private contadorFactura = 0;

  constructor(private readonly configService: ConfigService) {}

  // --------------------------------------------------------------------------
  // Generar CUF (Código Único de Facturación)
  // --------------------------------------------------------------------------
  // En producción: se compone de NIT + fecha + sucursal + modalidad +
  // tipo emisión + tipo factura + tipo documento sector + número factura +
  // punto de venta + código de control (módulo 11)
  // --------------------------------------------------------------------------
  async generarCUF(datos: {
    nitEmisor: string;
    fechaEmision: Date;
    sucursal: number;
    puntoVenta: number;
    numeroFactura: number;
  }): Promise<SiatCufResponse> {
    this.logger.log(`[SIAT Mock] Generando CUF para factura #${datos.numeroFactura}`);

    // Simulación del algoritmo de generación del CUF
    const timestamp = datos.fechaEmision.getTime().toString();
    const seed = `${datos.nitEmisor}${timestamp}${datos.sucursal}${datos.puntoVenta}${datos.numeroFactura}`;
    const hash = createHash('sha256').update(seed).digest('hex').toUpperCase();

    // Formato CUF: 40 caracteres hexadecimales (simulado)
    const cuf = `${hash.substring(0, 32)}${randomBytes(4).toString('hex').toUpperCase()}`;

    return {
      cuf,
      fechaGeneracion: new Date(),
    };
  }

  // --------------------------------------------------------------------------
  // Generar CUFD (Código Único de Factura Diaria)
  // --------------------------------------------------------------------------
  // En producción: se solicita al SIAT al inicio de cada jornada.
  // Tiene una vigencia de 24 horas.
  // --------------------------------------------------------------------------
  async generarCUFD(datos: {
    nitEmisor: string;
    sucursal: number;
    puntoVenta: number;
  }): Promise<SiatCufdResponse> {
    this.logger.log(`[SIAT Mock] Generando CUFD para sucursal ${datos.sucursal}, PV ${datos.puntoVenta}`);

    const randomPart = randomBytes(16).toString('hex').toUpperCase();
    const codigoControl = randomBytes(4).toString('hex').toUpperCase();

    // Vigencia: 24 horas desde la generación
    const fechaVigencia = new Date();
    fechaVigencia.setHours(fechaVigencia.getHours() + 24);

    return {
      cufd: `CUFD-${randomPart}`,
      codigoControl,
      fechaVigencia,
    };
  }

  // --------------------------------------------------------------------------
  // Obtener Leyenda SIAT
  // --------------------------------------------------------------------------
  // En producción: se consulta al catálogo de leyendas del SIAT
  // y se asigna aleatoriamente una leyenda activa.
  // --------------------------------------------------------------------------
  async obtenerLeyenda(): Promise<SiatLeyendaResponse> {
    const leyendas: SiatLeyendaResponse[] = [
      {
        codigoLeyenda: 1,
        leyenda: 'Ley N° 453: El proveedor de productos y servicios debe respetar los derechos del consumidor.',
      },
      {
        codigoLeyenda: 2,
        leyenda: 'Ley N° 453: Los servicios deben ser prestados en condiciones de calidad, calidez y sin discriminación.',
      },
      {
        codigoLeyenda: 3,
        leyenda: 'Ley N° 453: El consumidor tiene derecho a la información veraz, completa, adecuada, gratuita y oportuna.',
      },
      {
        codigoLeyenda: 4,
        leyenda: 'Ley N° 453: El usuario tiene derecho a recibir los productos o servicios en los plazos ofertados.',
      },
      {
        codigoLeyenda: 5,
        leyenda: 'Ley N° 453: La devolución de productos debe ser atendida en un plazo máximo de 10 días calendario.',
      },
    ];

    // Seleccionar leyenda aleatoria (como hace el SIAT real)
    const indice = Math.floor(Math.random() * leyendas.length);
    return leyendas[indice];
  }

  // --------------------------------------------------------------------------
  // Validar NIT del cliente
  // --------------------------------------------------------------------------
  async validarNIT(nit: string): Promise<SiatValidacionNitResponse> {
    this.logger.log(`[SIAT Mock] Validando NIT: ${nit}`);

    // Simulación: NITs con formato válido (7-12 dígitos)
    const esFormatoValido = /^\d{7,12}$/.test(nit);

    if (!esFormatoValido) {
      return {
        valido: false,
        razonSocial: '',
        mensaje: 'El NIT proporcionado no tiene un formato válido',
      };
    }

    return {
      valido: true,
      razonSocial: 'CONTRIBUYENTE VERIFICADO (MOCK)',
      mensaje: 'NIT válido y activo en el padrón del SIN',
    };
  }

  // --------------------------------------------------------------------------
  // Obtener siguiente número de factura
  // --------------------------------------------------------------------------
  // En producción: viene del SIAT o de una secuencia controlada
  // --------------------------------------------------------------------------
  async obtenerSiguienteNumeroFactura(): Promise<number> {
    this.contadorFactura++;
    return this.contadorFactura;
  }

  // --------------------------------------------------------------------------
  // Obtener NIT del emisor (desde configuración)
  // --------------------------------------------------------------------------
  getNitEmisor(): string {
    return this.configService.get<string>('BUSINESS_NIT', '1234567890');
  }
}
