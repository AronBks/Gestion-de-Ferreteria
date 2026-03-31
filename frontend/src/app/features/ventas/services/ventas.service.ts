import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, CreateVentaPayload } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/ventas';

  create(payload: CreateVentaPayload): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, payload);
  }

  findAll(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  cancelar(id: string): Observable<Venta> {
    return this.http.patch<Venta>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  getResumenHoy(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resumen/hoy`);
  }
}
