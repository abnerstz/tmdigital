import { Injectable, signal } from '@angular/core';

/**
 * Service para gerenciar estado de loading global
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal para indicar se está carregando
  public isLoading = signal<boolean>(false);
  
  // Contador de requisições ativas
  private requestCount = 0;

  /**
   * Incrementa contador e ativa loading
   */
  show(): void {
    this.requestCount++;
    if (this.requestCount > 0) {
      this.isLoading.set(true);
    }
  }

  /**
   * Decrementa contador e desativa loading quando chegar a zero
   */
  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.isLoading.set(false);
    }
  }

  /**
   * Reseta o estado de loading
   */
  reset(): void {
    this.requestCount = 0;
    this.isLoading.set(false);
  }
}

