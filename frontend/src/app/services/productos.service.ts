import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, ProductosResponse } from '../models/producto.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  obtenerProductos(page: number = 1, limit: number = 10): Observable<ProductosResponse> {
    return this.http.get<ProductosResponse>(
      `${this.apiUrl}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerProductoPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(
      this.apiUrl,
      producto,
      { headers: this.getHeaders() }
    );
  }

  actualizarProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.patch<Producto>(
      `${this.apiUrl}/${id}`,
      producto,
      { headers: this.getHeaders() }
    );
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
