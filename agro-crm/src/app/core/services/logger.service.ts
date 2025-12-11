import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  /**
   * Log de informação (apenas em desenvolvimento)
   */
  log(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(message, ...args);
    }
  }

  /**
   * Log de aviso (apenas em desenvolvimento)
   */
  warn(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.warn(message, ...args);
    }
  }

  /**
   * Log de erro
   */
  error(message: string, error?: any): void {
    if (!environment.production) {
      console.error(message, error);
    }
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.debug(message, ...args);
    }
  }

  /**
   * Método privado para enviar logs para serviço de monitoramento
   * Implementar quando integrar com Sentry, LogRocket, etc.
   */
  private sendToMonitoring(message: string, error?: any): void {
    // Implementar integração com serviço de monitoramento
  }
}

