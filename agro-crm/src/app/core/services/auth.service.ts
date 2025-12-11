import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'vendedor';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = `${environment.apiUrl}/auth`;

  // State management com Signals
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signal para indicar se está autenticado
  public isAuthenticated = signal<boolean>(false);

  constructor() {
    // Verifica se há usuário no localStorage ao inicializar
    this.checkStoredAuth();
  }

  /**
   * Verifica se há autenticação armazenada
   */
  private checkStoredAuth(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  /**
   * Realiza login
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        // Armazena token e usuário
        localStorage.setItem('auth_token', response.accessToken);
        localStorage.setItem('current_user', JSON.stringify(response.user));
        
        // Atualiza state
        this.currentUserSubject.next(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Realiza logout
   */
  logout(): void {
    // Limpa armazenamento
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    
    // Atualiza state
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    
    // Redireciona para login
    this.router.navigate(['/login']);
  }

  /**
   * Retorna o token armazenado
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Retorna o usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

