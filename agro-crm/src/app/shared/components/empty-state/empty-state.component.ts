import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="empty-state">
      <i [class]="icon" class="empty-icon"></i>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <p-button 
        *ngIf="actionLabel"
        [label]="actionLabel"
        [icon]="actionIcon"
        (onClick)="onAction()"
        [outlined]="true">
      </p-button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      color: var(--surface-400);
      margin-bottom: 1.5rem;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .empty-message {
      font-size: 1rem;
      color: var(--text-color-secondary);
      margin-bottom: 1.5rem;
      max-width: 400px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'pi pi-inbox';
  @Input() title: string = 'Nenhum item encontrado';
  @Input() message: string = 'Não há dados para exibir no momento.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string = 'pi pi-plus';
  
  onAction(): void {
    // Emitir evento para o componente pai
  }
}

