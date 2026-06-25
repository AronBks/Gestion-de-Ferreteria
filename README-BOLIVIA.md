# 🇧🇴 LOCALIZACIÓN BOLIVIA - FERRETERÍA POS

Este documento describe la localización del sistema POS de Ferretería específicamente adaptada a la normativa fiscal y comercial de **Bolivia**.

---

## ⚙️ Configuración Regional Integrada

El sistema está configurado por defecto con los siguientes parámetros bolivianos:
- **Moneda**: Boliviano (Bs. / BOB)
- **Zona Horaria**: `America/La_Paz` (GMT-4)
- **Formato Numérico**: `es-BO` (Separador decimal: `,` coma | Separador de miles: `.` punto)
  - Ejemplo en interfaz: **Bs. 1.500,50**
- **Pipe del Frontend**: Pipe dedicado (`currency-bolivia.pipe.ts`) para formatear montos automáticamente con el prefijo `Bs.` y dos decimales.

---

## ⚡ Facturación Electrónica SIAT (Impuestos Nacionales)

El sistema cuenta con un módulo completo de facturación electrónica (`FacturacionModule` en backend, `/facturacion/emitir`) que interactúa con los servidores de la **Agencia de Impuestos Nacionales de Bolivia**.

### 1. Flujo de Emisión de Facturas
1. Al consolidarse una venta en la interfaz POS (ADMIN, GERENTE o VENDEDOR), se habilita el botón **Emitir Factura**.
2. El sistema valida el **NIT/CI** del cliente y el **Código de Cliente** en la base de datos.
3. Se realiza una petición SOAP/REST al Web Service del SIAT enviando la información estructurada de la venta.
4. El SIAT devuelve el estado de aceptación de la factura, el **CUF** (Código Único de Factura) y el **CUFD** (Código Único de Facturación Diaria).
5. Se almacena la factura con estado `ACEPTADA` y se asocia de forma inmutable al registro de venta.

### 2. Formatos Fiscales Generados
- **Representación Gráfica (PDF)**: Formato estándar de factura que contiene el código QR fiscal, leyenda autorizada por el SIAT, firma digital del emisor y desglose de importes.
- **Archivo XML**: Documento estructurado con firma digital del desarrollador homologado enviado directamente al SIAT.

### 3. Anulación de Facturas (`PATCH /facturacion/:id/anular`)
Las facturas emitidas por error o devolución de mercadería se anulan directamente desde el panel de reportes (ADMIN o GERENTE).
- Requiere seleccionar un **Motivo de Anulación** homologado por el SIAT (ej. Datos del cliente incorrectos, devolución total).
- Se envía la firma de anulación al SIAT, revirtiendo el estado contable de la venta y restituyendo el stock físico de productos automáticamente.

### 4. Envío Automático por WhatsApp / Email
Una vez aprobada la factura por impuestos nacionales, se invoca a `EnvioFacturaService`:
- **WhatsApp**: Envío directo del link de descarga de la factura (PDF) y el archivo XML al número de teléfono del cliente registrado en la venta.
- **Email**: Envío con plantilla corporativa y adjuntos contables.

---

## 📊 Impuestos Aplicados

El sistema de caja y compras calcula de manera interna las siguientes tasas impositivas bolivianas:
- **IVA (Impuesto al Valor Agregado)**: **13%** (Incluido en el precio de venta al público).
- **IT (Impuesto a las Transacciones)**: **3%** (Cálculo interno contable para declaraciones de gastos de la ferretería).

---

## 📁 Estructura del Módulo de Facturación

```
backend/src/modules/facturacion/
├── dto/
│   ├── create-factura.dto.ts      # Validación del NIT, Razón Social, etc.
│   ├── filter-facturas.dto.ts      # Búsqueda por rango de fechas y estados SIAT
│   └── enviar-factura.dto.ts      # Destinatario para WhatsApp/Email
├── entities/
│   └── factura.entity.ts          # Tabla facturas (asociada a ventas, almacena CUF)
├── facturacion.controller.ts      # Endpoints REST expuestos
├── facturacion.service.ts         # Orquestación de transacciones y estados
├── siat.service.ts                # Conector de firma digital y envío al SIAT de Bolivia
└── envio-factura.service.ts       # Integración con APIs de WhatsApp y correo electrónico
```

---

## 📈 Roadmap y Siguientes Pasos (Bolivia)

Con las características de POS, reportes de márgenes y facturación SIAT 100% completas, el plan de localización contempla:
- [ ] **Soporte de Contingencia Offline**: Almacenamiento local de facturas en caso de caída del servidor del SIAT o corte de internet en tienda, para su posterior sincronización masiva automática (En Cola).
- [ ] **Actualización de Leyendas del SIAT**: Sincronización automática de leyendas mensuales emitidas por impuestos nacionales mediante el API de catálogos (Planificado).
- [ ] **Facturación de Compra/Venta por Lotes**: Integración con el módulo de compras para registrar facturas de proveedores bolivianos mediante escaneo de código de barra QR fiscal (Planificado).

---

**Sistema de Facturación Localizado para Bolivia** | v1.0 | 🇧🇴 2026
