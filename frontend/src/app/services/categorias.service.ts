import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = 'http://localhost:3000/api/categorias';
  private categoriasSubject = new BehaviorSubject<Categoria[]>([]);
  public categorias$ = this.categoriasSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.http.get<Categoria[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.categoriasSubject.next(data);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.categoriasSubject.next([]);
      }
    });
  }

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  obtenerCategoriasPorCache(): Categoria[] {
    return this.categoriasSubject.value;
  }

  obtenerCategoriaPorId(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }
}
