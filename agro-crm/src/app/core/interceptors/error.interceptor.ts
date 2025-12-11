import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

// Controle de redirecionamento para evitar loops
let isRedirecting = false;

/**
 * Interceptor para tratamento global de erros HTTP
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado';
      let shouldShowToast = true;

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Requisição inválida';
            break;
          case 401:
            errorMessage = 'Sessão expirada. Faça login novamente.';
            // Evita múltiplos redirecionamentos
            if (!isRedirecting && router.url !== '/login') {
              isRedirecting = true;
              authService.logout();
              router.navigate(['/login']).then(() => {
                setTimeout(() => isRedirecting = false, 1000);
              });
            } else {
              shouldShowToast = false; // Não mostra toast múltiplo
            }
            break;
          case 403:
            errorMessage = 'Você não tem permissão para acessar este recurso';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = error.error?.message || `Erro: ${error.status}`;
        }
      }

      // Exibe toast de erro apenas se necessário
      if (shouldShowToast) {
        messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage,
          life: 5000
        });
      }

      logger.error('Erro HTTP', {
        status: error.status,
        message: errorMessage,
        url: req.url,
        error: error
      });

      return throwError(() => error);
    })
  );
};
