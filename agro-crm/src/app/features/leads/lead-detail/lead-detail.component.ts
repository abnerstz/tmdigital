import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { LeadsService } from '../../../core/services/leads.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Lead } from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CpfPipe } from '../../../shared/pipes/cpf.pipe';
import { PhonePipe } from '../../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    SkeletonModule,
    StatusBadgeComponent,
    CpfPipe,
    PhonePipe
  ],
  template: `
    <div class="lead-detail" *ngIf="lead; else loadingTemplate">
      <div class="page-header">
        <div>
          <h1>{{ lead.name }}</h1>
          <p class="subtitle">Detalhes do Lead</p>
        </div>
        <div class="header-actions">
          <p-button 
            label="Voltar" 
            icon="pi pi-arrow-left" 
            [outlined]="true"
            routerLink="/leads">
          </p-button>
          <p-button 
            label="Editar" 
            icon="pi pi-pencil"
            [routerLink]="['/leads', lead.id, 'edit']">
          </p-button>
        </div>
      </div>

      <div class="content-grid">
        <p-card header="Informações Pessoais" styleClass="info-card">
          <div class="info-row">
            <span class="label">Nome:</span>
            <span class="value"><strong>{{ lead.name }}</strong></span>
          </div>
          <div class="info-row">
            <span class="label">CPF:</span>
            <span class="value">{{ lead.cpf | cpf }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ lead.email || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Telefone:</span>
            <span class="value">{{ lead.phone ? (lead.phone | phone) : '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Município:</span>
            <span class="value">{{ lead.city }}</span>
          </div>
        </p-card>

        <p-card header="Status e Acompanhamento" styleClass="info-card">
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value"><app-status-badge [status]="lead.status"></app-status-badge></span>
          </div>
          <div class="info-row">
            <span class="label">Primeiro Contato:</span>
            <span class="value">{{ lead.firstContactDate ? (lead.firstContactDate | date: 'dd/MM/yyyy') : '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Última Interação:</span>
            <span class="value">{{ lead.lastInteraction ? (lead.lastInteraction | date: 'dd/MM/yyyy HH:mm') : '-' }}</span>
          </div>
          <div class="info-row" *ngIf="lead.tags && lead.tags.length > 0">
            <span class="label">Tags:</span>
            <span class="value">
              <p-tag *ngFor="let tag of lead.tags" [value]="tag" styleClass="mr-2"></p-tag>
            </span>
          </div>
        </p-card>

        <p-card header="Observações" styleClass="full-width" *ngIf="lead.comments">
          <p>{{ lead.comments }}</p>
        </p-card>

        <p-card header="Propriedades Vinculadas" styleClass="full-width">
          <div class="card-actions">
            <p-button 
              label="Nova Propriedade" 
              icon="pi pi-plus" 
              size="small"
              routerLink="/properties/new"
              [queryParams]="{ leadId: lead.id }">
            </p-button>
          </div>
          
          <p-table 
            [value]="lead.properties || []"
            [tableStyle]="{'min-width': '100%'}"
            *ngIf="lead.properties && lead.properties.length > 0; else noProperties">
            <ng-template pTemplate="header">
              <tr>
                <th>Nome</th>
                <th>Cultura</th>
                <th>Área (ha)</th>
                <th>Município</th>
                <th>Ações</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-prop>
              <tr>
                <td>{{ prop.name || 'Sem nome' }}</td>
                <td><p-tag [value]="prop.cropType"></p-tag></td>
                <td class="text-right"><strong>{{ prop.areaHectares }} ha</strong></td>
                <td>{{ prop.city }}</td>
                <td>
                  <p-button 
                    icon="pi pi-eye" 
                    [text]="true" 
                    [rounded]="true"
                    [routerLink]="['/properties', prop.id]">
                  </p-button>
                </td>
              </tr>
            </ng-template>
          </p-table>

          <ng-template #noProperties>
            <div class="empty-message">
              <i class="pi pi-map-marker"></i>
              <p>Nenhuma propriedade vinculada a este lead.</p>
            </div>
          </ng-template>
        </p-card>

        <p-card header="Estatísticas" styleClass="full-width">
          <div class="stats-grid">
            <div class="stat-item">
              <i class="pi pi-map-marker stat-icon"></i>
              <div>
                <span class="stat-value">{{ lead.properties?.length || 0 }}</span>
                <span class="stat-label">Propriedades</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="pi pi-chart-line stat-icon"></i>
              <div>
                <span class="stat-value">{{ lead.totalAreaHectares || 0 }} ha</span>
                <span class="stat-label">Área Total</span>
              </div>
            </div>
          </div>
        </p-card>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="page-header">
        <p-skeleton width="300px" height="2rem"></p-skeleton>
        <p-skeleton width="200px" height="2.5rem"></p-skeleton>
      </div>
      <div class="content-grid">
        <p-skeleton height="200px" *ngFor="let i of [1,2,3,4]"></p-skeleton>
      </div>
    </ng-template>
  `,
  styles: [`
    .lead-detail {
      animation: fadeIn 0.3s ease-in;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: var(--text-color-secondary);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--surface-border);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row .label {
      font-weight: 600;
      color: var(--text-color-secondary);
    }

    .info-row .value {
      text-align: right;
      color: var(--text-color);
    }

    .card-actions {
      margin-bottom: 1rem;
      display: flex;
      justify-content: flex-end;
    }

    .empty-message {
      text-align: center;
      padding: 3rem;
      color: var(--text-color-secondary);
    }

    .empty-message i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--surface-50);
      border-radius: 12px;
    }

    .stat-icon {
      font-size: 2rem;
      color: var(--primary-color);
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LeadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private leadsService = inject(LeadsService);
  private logger = inject(LoggerService);

  lead?: Lead;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadLead(id);
  }

  loadLead(id: string): void {
    this.leadsService.getLeadById(id).subscribe({
      next: (data) => {
        this.lead = data;
      },
      error: (error) => {
        this.logger.error('Erro ao carregar lead', error);
      }
    });
  }
}

