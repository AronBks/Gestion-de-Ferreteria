import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardResponse,
  ReporteResponse,
  ReporteFiltros,
  ReporteExportResponse,
  CategoriaFiltro,
} from '../models/reportes.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'http://localhost:3000/api/reportes';

  constructor(private http: HttpClient) {}

  // ============================================================
  // Dashboard original (compatibilidad)
  // ============================================================
  getDashboard(dias: number = 30): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard?dias=${dias}`);
  }

  // ============================================================
  // Módulo de Reportes — Datos completos con filtros
  // ============================================================
  getReportesData(filtros: ReporteFiltros): Observable<ReporteResponse> {
    let params = new HttpParams();

    if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros.categoriaId) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros.metodoPago) params = params.set('metodoPago', filtros.metodoPago);
    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.limit) params = params.set('limit', filtros.limit.toString());

    return this.http.get<ReporteResponse>(`${this.apiUrl}/modulo`, { params });
  }

  // ============================================================
  // Exportación de datos
  // ============================================================
  getExportData(filtros: ReporteFiltros): Observable<ReporteExportResponse> {
    let params = new HttpParams();

    if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros.categoriaId) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros.metodoPago) params = params.set('metodoPago', filtros.metodoPago);

    return this.http.get<ReporteExportResponse>(`${this.apiUrl}/exportar`, { params });
  }

  // ============================================================
  // Categorías para filtro
  // ============================================================
  getCategorias(): Observable<CategoriaFiltro[]> {
    return this.http.get<CategoriaFiltro[]>(`${this.apiUrl}/categorias`);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}