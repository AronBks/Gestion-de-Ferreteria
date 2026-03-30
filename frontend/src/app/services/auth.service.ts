import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, AuthState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private platformId = inject(PLATFORM_ID);
  
  private authState = new BehaviorSubject<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false
  });

  public auth$ = this.authState.asObservable();

  constructor(private http: HttpClient) {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user_info');
        
        if (token && userStr && userStr !== 'undefined') {
          const user = JSON.parse(userStr);
          this.authState.next({
            token,
            user,
            isAuthenticated: true
          });
        }
      } catch (error) {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
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

  public getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  public getUser(): any {
    return this.authState.value.user;
  }

  public isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        const token = response.access_token;
        const user = response.user;
        
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_info', JSON.stringify(user));
        }
        
        this.authState.next({
          token,
          user,
          isAuthenticated: true
        });
      }),
      catchError(err => {
        this.clearStorage();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this.authState.next({
      token: null,
      user: null,
      isAuthenticated: false
    });
  }

  saveUserInfo(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_info', JSON.stringify(user));
      const currentState = this.authState.value;
      this.authState.next({
        ...currentState,
        user: user
      });
    }
  }
}
