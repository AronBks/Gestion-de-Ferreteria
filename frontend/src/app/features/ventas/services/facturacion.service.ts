import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura, EnvioResult, CanalEnvio, PaginatedResponse } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/facturacion';

  /** Emitir factura electrónica para una venta */
  emitirFactura(ventaId: string, clienteTelefono?: string): Observable<Factura> {
    return this.http.post<Factura>(`${this.apiUrl}/emitir`, {
      ventaId,
      clienteTelefono,
    });
  }

  /** Anular factura emitida */
  anularFactura(facturaId: string, motivo: string): Observable<Factura> {
    return this.http.patch<Factura>(`${this.apiUrl}/${facturaId}/anular`, { motivo });
  }

  /** Enviar factura al cliente (WhatsApp wa.me URL o Email) */
  enviarFactura(facturaId: string, canal: CanalEnvio, destino?: string): Observable<EnvioResult> {
    return this.http.post<EnvioResult>(`${this.apiUrl}/${facturaId}/enviar`, {
      facturaId,
      canal,
      destino,
    });
  }

  /** Obtener factura por ID de venta */
  obtenerPorVenta(ventaId: string): Observable<Factura> {
    return this.http.get<Factura>(`${this.apiUrl}/venta/${ventaId}`);
  }

  /** Listar facturas con filtros paginados */
  listar(filtros?: any): Observable<PaginatedResponse<Factura>> {
    return this.http.get<PaginatedResponse<Factura>>(this.apiUrl, { params: filtros || {} });
  }
}
