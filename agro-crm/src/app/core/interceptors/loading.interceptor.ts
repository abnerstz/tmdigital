import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor para gerenciar estado de loading global
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Incrementa contador de requisições ativas
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Decrementa contador quando a requisição terminar
      loadingService.hide();
    })
  );
};

