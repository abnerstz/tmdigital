import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule
  ],
  template: `
    <div class="login-container">
      <div class="login-content">
        <div class="login-header">
          <div class="logo">
            <img src="/logo.png" alt="Agro CRM" class="logo-image">
          </div>
          <p class="subtitle">Sistema de Gestão de Leads Agrícolas</p>
        </div>

        <p-card styleClass="login-card">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-field">
              <label for="email">Email</label>
              <input 
                pInputText 
                id="email" 
                formControlName="email"
                placeholder="seu@email.com"
                [class.ng-invalid]="isFieldInvalid('email')"
                autocomplete="email">
              <small class="p-error" *ngIf="isFieldInvalid('email')">
                Email é obrigatório
              </small>
            </div>

            <div class="form-field">
              <label for="password">Senha</label>
              <p-password 
                id="password" 
                formControlName="password"
                [feedback]="false"
                placeholder="Sua senha"
                [toggleMask]="true"
                [class.ng-invalid]="isFieldInvalid('password')"
                autocomplete="current-password"
                styleClass="w-full">
              </p-password>
              <small class="p-error" *ngIf="isFieldInvalid('password')">
                Senha é obrigatória
              </small>
            </div>

            <div class="form-options">
              <div class="remember-me">
                <p-checkbox 
                  formControlName="rememberMe" 
                  [binary]="true"
                  inputId="rememberMe">
                </p-checkbox>
                <label for="rememberMe">Lembrar-me</label>
              </div>
            </div>

            <p-button 
              type="submit"
              label="Entrar"
              icon="pi pi-sign-in"
              [loading]="loading"
              [disabled]="loading"
              styleClass="w-full">
            </p-button>
          </form>
        </p-card>

        <div class="login-footer">
          <p>&copy; 2024 Agro CRM. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%);
      padding: 2rem;
    }

    .login-content {
      width: 100%;
      max-width: 420px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
      color: var(--text-color);
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .logo-image {
      height: 4rem;
      width: auto;
      object-fit: contain;
    }

    .subtitle {
      font-size: 1rem;
      color: var(--text-color-secondary);
      margin: 0;
    }

    :host ::ng-deep .login-card {
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .form-field {
      margin-bottom: 1.5rem;
    }

    .form-field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .form-field input,
    :host ::ng-deep .form-field .p-password {
      width: 100%;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .forgot-password {
      color: var(--primary-color);
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: none;
    }

    .forgot-password:hover {
      text-decoration: underline;
    }

    .login-footer {
      text-align: center;
      margin-top: 2rem;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .p-error {
      display: block;
      margin-top: 0.25rem;
    }

  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private logger = inject(LoggerService);

  loginForm!: FormGroup;
  loading = false;
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    // Se já estiver autenticado, redireciona
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Pega URL de retorno se houver
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Inicializa formulário
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsDirty();
      });
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Login realizado com sucesso!'
        });
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.logger.error('Erro ao fazer login', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Email ou senha inválidos'
        });
        this.loading = false;
      }
    });
  }
}

