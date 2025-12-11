import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { LeadStatus } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, TagModule],
  template: `
    <p-tag [value]="getStatusLabel()" [severity]="getSeverity()" [rounded]="true"></p-tag>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status!: LeadStatus;

  getStatusLabel(): string {
    const labels: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: 'Novo',
      [LeadStatus.INITIAL_CONTACT]: 'Contato Inicial',
      [LeadStatus.IN_NEGOTIATION]: 'Em Negociação',
      [LeadStatus.CONVERTED]: 'Convertido',
      [LeadStatus.LOST]: 'Perdido'
    };
    return labels[this.status] || this.status;
  }

  getSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    const severities: Record<LeadStatus, any> = {
      [LeadStatus.NEW]: 'info',
      [LeadStatus.INITIAL_CONTACT]: 'warn',
      [LeadStatus.IN_NEGOTIATION]: 'secondary',
      [LeadStatus.CONVERTED]: 'success',
      [LeadStatus.LOST]: 'danger'
    };
    return severities[this.status];
  }
}

