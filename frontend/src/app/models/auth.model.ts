export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user?: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
  };
}

export interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
}
