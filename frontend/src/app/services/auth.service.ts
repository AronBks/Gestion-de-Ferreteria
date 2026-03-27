import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { LoginRequest, LoginResponse, AuthState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private platformId = inject(PLATFORM_ID);
  private authState = new BehaviorSubject<AuthState>({
    token: this.getTokenSafe(),
    user: this.getUserFromStorageSafe(),
    isAuthenticated: !!this.getTokenSafe()
  });

  public auth$ = this.authState.asObservable();

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
    }
  }

  private getTokenSafe(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getUserFromStorageSafe(): any {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user_info');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        const token = response.access_token;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('auth_token', token);
        }
        
        this.authState.next({
          token,
          user: response.user,
          isAuthenticated: true
        });
      }),
      catchError(err => {
        console.error('Login error:', err);
        throw err;
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    }
    this.authState.next({
      token: null,
      user: null,
      isAuthenticated: false
    });
  }

  getToken(): string | null {
    return this.getTokenSafe();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private restoreSession(): void {
    const token = this.getTokenSafe();
    if (token) {
      this.authState.next({
        token,
        user: this.getUserFromStorageSafe(),
        isAuthenticated: true
      });
    }
  }

  saveUserInfo(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_info', JSON.stringify(user));
    }
  }
}
