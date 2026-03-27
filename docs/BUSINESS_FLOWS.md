# 🔄 Flujos de Negocio - Ferretería POS

## 1. Flujo de Venta en POS

```mermaid
graph TD
    A["👤 Cliente Llega a Caja"] --> B["📱 Vendedor Abre Sistema"]
    B --> C{¿Productos?}
    C -->|Buscar| D["🔍 Buscar en Catálogo"]
    D --> E["📦 Agregar Producto a Carrito"]
    E --> F{¿Más Producto?}
    F -->|Sí| C
    F -->|No| G["💰 Revisar Total"]
    G --> H{¿Descuento?}
    H -->|Sí| I["🏷️ Aplicar Descuento"]
    H -->|No| J["💳 Seleccionar Método Pago"]
    I --> J
    J --> K{¿Efectivo?}
    K -->|Sí| L["💵 Recibir Dinero"]
    K -->|Tarjeta| M["💳 Procesar Tarjeta"]
    K -->|Transferencia| N["🏦 Aguardar Confirmación"]
    L --> O["📄 Generar Comprobante"]
    M --> O
    N --> O
    O --> P["✅ Venta Registrada"]
    P --> Q["📊 Actualizar Inventario"]
    Q --> R["📝 Registrar en Caja"]
    R --> S["🔔 Alerta si Stock Bajo"]
    S --> T["✨ Devolver Vuelto/Comprobante"]
```

---

## 2. Flujo de Compra a Proveedor

```mermaid
graph TD
    A["📋 Almacenero Revisa Stock"] --> B{¿Stock Bajo?}
    B -->|Sí| C["📞 Contactar Proveedor"]
    C --> D["📝 Crear Orden de Compra"]
    D --> E["👨‍💼 Gerente Aprueba"]
    E --> F{¿Aprobada?}
    F -->|No| G["❌ Orden Rechazada"]
    F -->|Sí| H["📨 Enviar a Proveedor"]
    H --> I["⏳ En Tránsito"]
    I --> J["📦 Recepción en Almacén"]
    J --> K["🔍 Inspeccionar Mercadería"]
    K --> L{¿OK?}
    L -->|Problemas| M["🔄 Coordinar Devolución"]
    L -->|OK| N["✅ Registrar Compra"]
    N --> O["📊 Actualizar Stock"]
    O --> P["📋 Registrar Lotes"]
    P --> Q["💾 Guardar en BD"]
```

---

## 3. Flujo de Devolución/Cambio

```mermaid
graph TD
    A["😞 Cliente solicita Devolución"] --> B["🔍 Verificar Comprobante"]
    B --> C{¿Válido?}
    C -->|No| D["❌ Rechazar Devolución"]
    C -->|Sí| E["📋 Revisar Producto"]
    E --> F{¿En buen estado?}
    F -->|Dañado| G["💰 Aceptar Devolución"]
    F -->|Bien| H{¿Dentro plazo?}
    H -->|Sí| G
    H -->|No| I["⏰ Rechazar por plazo"]
    G --> J["💵 Procesar Reembolso"]
    J --> K["📝 Generar nota de devolución"]
    K --> L["🗂️ Guardar Documento"]
    L --> M["📊 Actualizar Inventario"]
    M --> N["💾 Registrar en Sistema"]
```

---

## 4. Flujo de Cierre de Caja

```mermaid
graph TD
    A["⏰ Fin del Turno"] --> B["📊 Vendedor prepara Cierre"]
    B --> C["💰 Contar Dinero en Caja"]
    C --> D["📋 Ingresar Saldo Real"]
    D --> E["✅ Sistema Calcula Total Esperado"]
    E --> F{¿Cuadra?}
    F -->|Sí| G["✨ Cierre Correcto"]
    F -->|No| H["⚠️ Diferencia Detectada"]
    G --> I["📝 Registrar Observaciones"]
    H --> I
    I --> J["👨‍💼 Gerente Revisa"]
    J --> K{¿Aprobado?}
    K -->|No| L["🔁 Reabrir Caja"]
    K -->|Sí| M["✅ Caja Cerrada"]
    M --> N["📊 Generar Reportes"]
    N --> O["💾 Guardar Estado Final"]
```

---

## 5. Flujo de Auditoría y Seguridad

```mermaid
graph TD
    A["🔐 Usuario Realiza Acción"] --> B["📝 Sistema Registra Evento"]
    B --> C["🔏 Encriptar Datos Sensibles"]
    C --> D["💾 Guardar en Tabla AUDITORIA"]
    D --> E["⏱️ Timestamp Automático"]
    E --> F["👤 Registrar ID Usuario"]
    F --> G["🌐 Guardar IP Address"]
    G --> H["📱 Guardar User Agent"]
    H --> I["✅ Evento Auditado"]
    I --> J{¿Acción Sospechosa?}
    J -->|Sí| K["🚨 Alerta Seguridad"]
    J -->|No| L["✨ Operación Normal"]
    K --> M["📧 Notificar Admin"]
    L --> N["📊 Disponible en Reportes"]
```

---

## 6. Flujo de Alertas de Inventario

```mermaid
graph TD
    A["📦 Sistema Verifica Stock"] --> B{¿Stock <= Stock Mínimo?}
    B -->|Sí| C["🔔 Crear Alerta"]
    B -->|No| D["✅ Stock OK"]
    C --> E["📋 Guardar en ALERTAS_INVENTARIO"]
    E --> F["🎯 Categorizarrt Urgencia"]
    F --> G{¿Stock = 0?}
    G -->|Sí| H["🚨 CRÍTICO"]
    G -->|No| I["⚠️ BAJO"]
    H --> J["📧 Email Inmediato"]
    I --> K["📊 Mostrar en Dashboard"]
    J --> L["📱 Notificación Almacén"]
    K --> M["📋 Sugerir Compra"]
    L --> N["✅ Acción Requerida"]
```

---

## 7. Flujo de Reportes y Analytics

```mermaid
graph TD
    A["📊 Usuario Solicita Reporte"] --> B{¿Tipo?}
    B -->|Ventas| C["💹 Consultar VENTAS"]
    B -->|Inventario| D["📦 Consultar PRODUCTOS"]
    B -->|Caja| E["💰 Consultar CAJA"]
    B -->|Proveedores| F["🏢 Consultar PROVEEDORES"]
    C --> G["📈 Procesar Datos"]
    D --> G
    E --> G
    F --> G
    G --> H["📋 Filtrar por Período"]
    H --> I["🔍 Aplicar Filtros Adicionales"]
    I --> J{¿Formato?}
    J -->|PDF| K["📄 Generar PDF"]
    J -->|Excel| L["📊 Generar Excel"]
    J -->|Pantalla| M["🖥️ Mostrar en UI"]
    K --> N["✅ Reporte Listo"]
    L --> N
    M --> N
```

---

## 8. Flujo de Autenticación y Autorización

```mermaid
graph TD
    A["👤 Usuario Accede a Sistema"] --> B["📧 Ingresa Email"]
    B --> C["🔑 Ingresa Contraseña"]
    C --> D["🔍 Verificar en BD"]
    D --> E{¿Existe?}
    E -->|No| F["❌ Usuario No Encontrado"]
    E -->|Sí| G["🔐 Validar Contraseña Hasheada"]
    G --> H{¿Válida?}
    H -->|No| I["❌ Contraseña Incorrecta"]
    H -->|Sí| J["✅ Credenciales OK"]
    F --> K["🚫 Denegar Acceso"]
    I --> K
    J --> L["🎫 Generar JWT Token"]
    L --> M["💾 Guardar en LocalStorage"]
    M --> N["🛡️ Validar Rol y Permisos"]
    N --> O["✅ Acceso Concedido"]
    O --> P["🚪 Redirigir a Módulo Permitido"]
```

---

## 9. Flujo de Gestión de Proveedores

```mermaid
graph TD
    A["📝 Registrar Nuevo Proveedor"] --> B["📋 Llenar Formulario"]
    B --> C["✅ Validar Datos"]
    C --> D{¿OK?}
    D -->|Errores| E["❌ Mostrar Errores"]
    D -->|Válido| F["💾 Guardar en BD"]
    F --> G["📞 Guardar Contactos"]
    G --> H["🏦 Guardar Datos Bancarios"]
    H --> I["✨ Proveedor Registrado"]
    I --> J{¿Acreedor?}
    J -->|Sí| K["💳 Activar Crédito"]
    J -->|No| L["💵 Solo Contado"]
    K --> M["📊 Configurar Límite"]
    M --> N["✅ Proveedor Activo"]
    L --> N
    N --> O["📋 Disponible para Compras"]
```

---

## 10. Flujo Completo: De Compra a Venta

```mermaid
graph LR
    A["🏢 Proveedor"] -->|"Envía Mercadería"| B["📦 Almacén"]
    B -->|"Recibe y Registra"| C["💾 BD: Compra"]
    C -->|"Actualiza"| D["📊 Inventario"]
    D -->|"Stock OK"| E["👨‍💼 Catálogo"]
    E -->|"Cliente Busca"| F["👤 Cliente"]
    F -->|"Selecciona"| G["👨‍💻 Caja POS"]
    G -->|"Procesa"| H["💳 Pago"]
    H -->|"Actualiza"| I["📊 Inventario"]
    I -->|"Stock Bajo"| J["🔔 Alerta"]
    J -->|"Requiere Compra"| K["📋 Nueva Orden"]
    K -->|"Inicia Ciclo"| A
    H -->|"Registra"| L["💰 Caja Diaria"]
    L -->|"Fin de Turno"| M["📊 Cierre"]
    M -->|"Genera"| N["📈 Reportes"]
```

---

## 11. Matriz de Productos - Ciclo de Vida

```mermaid
graph TD
    A["🆕 Nuevo Producto"] --> B["📋 Ingresar Datos"]
    B --> C["✅ Validar"]
    C --> D["💾 Guardar"]
    D --> E["🟢 ACTIVO"]
    E --> F{¿En Stock?}
    F -->|Sí| G["📊 Disponible"]
    F -->|No| H["⚠️ Agotado"]
    G --> I{¿Historial?}
    H --> I
    I -->|Bien| J["📈 Mantener"]
    I -->|Mal| K["⛔ DESCONTINUADO"]
    J --> L{¿Cambio?}
    L -->|Precio| M["💰 Actualizar Precio"]
    L -->|Stock| N["📦 Actualizar Stock"]
    L -->|Info| O["📝 Actualizar Info"]
    M --> E
    N --> E
    O --> E
    K --> P["🗑️ Archivado"]
```

---

## 12. Estado de Usuarios - RBAC

```mermaid
graph TD
    A["👥 Usuario Nuevo"] --> B{¿Rol?}
    B -->|ADMIN| C["🔑 Acceso Total"]
    B -->|GERENTE| D["👔 Gestión Completa"]
    B -->|VENDEDOR| E["📱 POS Básico"]
    B -->|ALMACENERO| F["📦 Inventario"]
    B -->|AUDITOR| G["📋 Solo Lectura"]
    C --> H["✅ Activo"]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I{¿Cambios?}
    I -->|Rol| J["🔄 Actualizar Rol"]
    I -->|Estado| K["🔐 Suspender/Activar"]
    I -->|Permiso| L["🛡️ Agregar Permiso"]
    J --> M["💾 Guardar Cambios"]
    K --> M
    L --> M
```

---

## Leyenda de Símbolos

| Símbolo | Significado |
|---------|------------|
| 👤 | Usuario/Actor |
| 📱 | Sistema/Interfaz |
| 💾 | Operación en BD |
| ✅ | Éxito/Completado |
| ❌ | Error/Rechazado |
| 🔔 | Alerta/Notificación |
| 💰 | Operación Financiera |
| 📊 | Reporte/Análisis |
| 🔐 | Seguridad |
| ⏰ | Tiempo/Fecha |

---

**Versión**: 1.0  
**Última Actualización**: 27 Marzo 2026  
**Diagramas**: Mermaid

