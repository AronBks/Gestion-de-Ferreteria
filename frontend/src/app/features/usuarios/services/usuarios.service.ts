import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, CreateUsuarioPayload } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/usuarios';

  findAll(rol?: string, estado?: string): Observable<Usuario[]> {
    let params = new HttpParams();
    if (rol) params = params.set('rol', rol);
    if (estado) params = params.set('estado', estado);
    return this.http.get<Usuario[]>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, payload);
  }

  update(id: string, payload: Partial<CreateUsuarioPayload>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}`, payload);
  }

  updateEstado(id: string, estado: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  resetPassword(id: string): Observable<{ temporal: string }> {
    return this.http.patch<{ temporal: string }>(`${this.apiUrl}/${id}/password`, {});
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}