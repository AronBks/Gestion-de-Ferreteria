import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura, CanalEnvio } from './entities/factura.entity';

// ============================================================================
// EnvioFacturaService — Envío de facturas por WhatsApp (wa.me) y Email
// ============================================================================
// WhatsApp: Opción A (Frontend-driven) — Genera URL wa.me para abrir en
// nueva pestaña. CERO COSTOS, sin APIs de pago.
// Email: Nodemailer con SMTP estándar (Gmail u otro proveedor gratuito).
// ============================================================================

/** Resultado del envío de factura */
export interface EnvioResult {
  success: boolean;
  canal: CanalEnvio;
  destino: string;
  mensaje: string;
  whatsappUrl?: string; // Solo para canal WHATSAPP
}

@Injectable()
export class EnvioFacturaService {
  private readonly logger = new Logger(EnvioFacturaService.name);

  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    private readonly configService: ConfigService,
  ) {}

  // --------------------------------------------------------------------------
  // Enviar factura — Orquestador principal
  // --------------------------------------------------------------------------
  async enviarFactura(
    facturaId: string,
    canal: CanalEnvio,
    destino?: string,
  ): Promise<EnvioResult> {
    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
      relations: ['venta', 'venta.vendedor', 'venta.detalles', 'venta.detalles.producto'],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${facturaId} no encontrada`);
    }

    const destinoFinal = destino || factura.venta?.clienteTelefono || '';

    let resultado: EnvioResult;

    switch (canal) {
      case CanalEnvio.WHATSAPP:
        resultado = await this.generarEnlaceWhatsApp(factura, destinoFinal);
        break;
      case CanalEnvio.EMAIL:
        resultado = await this.enviarPorEmail(factura, destinoFinal);
        break;
      default:
        resultado = {
          success: false,
          canal,
          destino: destinoFinal,
          mensaje: 'Canal de envío no soportado',
        };
    }

    // Actualizar registro de factura con datos del envío
    if (resultado.success) {
      await this.facturaRepository.update(facturaId, {
        enviadaCliente: true,
        canalEnvio: canal,
        fechaEnvio: new Date(),
        destinoEnvio: destinoFinal,
      });
    }

    return resultado;
  }

  // --------------------------------------------------------------------------
  // WhatsApp — Opción A: Generar URL wa.me (Frontend-driven, CERO COSTOS)
  // --------------------------------------------------------------------------
  private async generarEnlaceWhatsApp(
    factura: Factura,
    telefono: string,
  ): Promise<EnvioResult> {
    this.logger.log(`[WhatsApp] Generando enlace wa.me para factura #${factura.numeroFactura}`);

    // Limpiar número de teléfono (solo dígitos)
    const telefonoLimpio = telefono.replace(/\D/g, '');

    // Agregar prefijo de Bolivia si no lo tiene
    const telefonoCompleto = telefonoLimpio.startsWith('591')
      ? telefonoLimpio
      : `591${telefonoLimpio}`;

    if (telefonoCompleto.length < 11) {
      return {
        success: false,
        canal: CanalEnvio.WHATSAPP,
        destino: telefono,
        mensaje: 'Número de teléfono inválido. Debe incluir al menos 8 dígitos.',
      };
    }

    // Construir mensaje profesional
    const nombreEmpresa = this.configService.get<string>('BUSINESS_NAME', 'Ferretería Bolivia');
    const venta = factura.venta;
    const clienteNombre = venta?.clienteNombre || 'Estimado/a Cliente';
    const fechaFormateada = new Date(factura.fechaEmision).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Construir resumen de productos
    const productosResumen = venta?.detalles
      ?.map((d) => `  • ${d.producto?.nombre || 'Producto'} x${d.cantidad} — Bs. ${Number(d.subtotal).toFixed(2)}`)
      .join('\n') || '  (Ver detalle en factura adjunta)';

    const mensaje = [
      `🧾 *FACTURA ELECTRÓNICA*`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `Hola *${clienteNombre}* 👋`,
      ``,
      `Gracias por tu compra en *${nombreEmpresa}*. Aquí tienes el detalle de tu factura:`,
      ``,
      `📋 *Factura N°:* ${factura.numeroFactura}`,
      `📅 *Fecha:* ${fechaFormateada}`,
      `🔑 *CUF:* ${factura.cuf ? factura.cuf.substring(0, 16) + '...' : 'Pendiente'}`,
      ``,
      `🛒 *Productos:*`,
      productosResumen,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `💰 *TOTAL: Bs. ${Number(venta?.total || 0).toFixed(2)}*`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `✅ Estado: ${factura.estadoSiat}`,
      ``,
      `${factura.leyendaSiat || ''}`,
      ``,
      `¡Gracias por preferirnos! 🏗️🔧`,
      `*${nombreEmpresa}*`,
    ].join('\n');

    // Codificar mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrl = `https://wa.me/${telefonoCompleto}?text=${mensajeCodificado}`;

    this.logger.log(`[WhatsApp] URL generada exitosamente para tel: ${telefonoCompleto}`);

    return {
      success: true,
      canal: CanalEnvio.WHATSAPP,
      destino: telefonoCompleto,
      mensaje: 'Enlace de WhatsApp generado exitosamente. Ábrelo para enviar la factura.',
      whatsappUrl,
    };
  }

  // --------------------------------------------------------------------------
  // Email — Nodemailer con SMTP estándar (Gmail u otro gratuito)
  // --------------------------------------------------------------------------
  private async enviarPorEmail(
    factura: Factura,
    email: string,
  ): Promise<EnvioResult> {
    this.logger.log(`[Email] Preparando envío de factura #${factura.numeroFactura} a ${email}`);

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        canal: CanalEnvio.EMAIL,
        destino: email,
        mensaje: 'Dirección de email inválida.',
      };
    }

    try {
      // -------------------------------------------------------------------
      // CONFIGURACIÓN NODEMAILER
      // -------------------------------------------------------------------
      // Para activar en producción:
      // 1. npm install nodemailer @types/nodemailer
      // 2. Configurar variables de entorno en .env:
      //    EMAIL_HOST=smtp.gmail.com
      //    EMAIL_PORT=587
      //    EMAIL_USER=tu_correo@gmail.com
      //    EMAIL_PASS=tu_app_password (Contraseña de Aplicación de Google)
      // 3. Descomentar el bloque de abajo
      // -------------------------------------------------------------------

      /*
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
        port: this.configService.get<number>('EMAIL_PORT', 587),
        secure: false,
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASS'),
        },
      });

      const nombreEmpresa = this.configService.get<string>('BUSINESS_NAME', 'Ferretería Bolivia');
      const venta = factura.venta;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #F59E0B; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🧾 Factura Electrónica</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">N° ${factura.numeroFactura}</p>
          </div>
          <div style="background: #1a1a2e; color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Estimado/a <strong>${venta?.clienteNombre || 'Cliente'}</strong>,</p>
            <p>Gracias por su compra. Adjunto encontrará su factura electrónica.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="border-bottom: 1px solid #3d3d5c;">
                <td style="padding: 10px; color: #b0b0cc;">Factura N°</td>
                <td style="padding: 10px; text-align: right;">${factura.numeroFactura}</td>
              </tr>
              <tr style="border-bottom: 1px solid #3d3d5c;">
                <td style="padding: 10px; color: #b0b0cc;">CUF</td>
                <td style="padding: 10px; text-align: right; font-size: 11px;">${factura.cuf || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #3d3d5c;">
                <td style="padding: 10px; color: #b0b0cc;">Total</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #F59E0B;">Bs. ${Number(venta?.total || 0).toFixed(2)}</td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #808094;">${factura.leyendaSiat || ''}</p>
            <p style="margin-top: 20px;">Atentamente,<br/><strong>${nombreEmpresa}</strong></p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${nombreEmpresa}" <${this.configService.get<string>('EMAIL_USER')}>`,
        to: email,
        subject: `Factura N° ${factura.numeroFactura} — ${nombreEmpresa}`,
        html: htmlContent,
        // TODO: Adjuntar PDF cuando esté generado
        // attachments: factura.pdfUrl ? [{ path: factura.pdfUrl }] : [],
      });

      return {
        success: true,
        canal: CanalEnvio.EMAIL,
        destino: email,
        mensaje: 'Factura enviada exitosamente por email.',
      };
      */

      // --- Respuesta simulada mientras Nodemailer no está instalado ---
      this.logger.warn(
        `[Email Mock] Simulando envío a ${email}. ` +
        `Para activar: npm install nodemailer y configurar SMTP en .env`,
      );

      return {
        success: true,
        canal: CanalEnvio.EMAIL,
        destino: email,
        mensaje:
          'Email simulado exitosamente. Para envío real, instala Nodemailer ' +
          '(npm install nodemailer) y configura las credenciales SMTP en .env',
      };
    } catch (error) {
      this.logger.error(`[Email] Error al enviar factura: ${error.message}`);
      return {
        success: false,
        canal: CanalEnvio.EMAIL,
        destino: email,
        mensaje: `Error al enviar email: ${error.message}`,
      };
    }
  }
}
