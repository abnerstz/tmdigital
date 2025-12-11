import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, DashboardMetrics } from '../../core/services/dashboard.service';
import { LoggerService } from '../../core/services/logger.service';
import { Lead } from '../../core/models';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ButtonModule,
    SkeletonModule,
    MetricCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Visão geral do sistema</p>
      </div>

      <!-- Métricas Principais -->
      <div class="metrics-grid" *ngIf="!loadingMetrics(); else loadingSkeleton">
        <app-metric-card
          label="Total de Leads"
          [value]="metrics()?.totalLeads || 0"
          icon="pi pi-users"
          variant="primary">
        </app-metric-card>

        <app-metric-card
          label="Propriedades"
          [value]="metrics()?.totalProperties || 0"
          icon="pi pi-map-marker"
          variant="success">
        </app-metric-card>

        <app-metric-card
          label="Área Total"
          [value]="(metrics()?.totalAreaHectares || 0) + ' ha'"
          icon="pi pi-chart-line"
          variant="warning">
        </app-metric-card>

        <app-metric-card
          label="Leads Prioritários"
          [value]="metrics()?.priorityLeads || 0"
          icon="pi pi-star-fill"
          variant="danger">
        </app-metric-card>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid" *ngIf="!loadingCharts()">
        <p-card header="Leads por Status" styleClass="chart-card">
          <p-chart type="pie" [data]="leadsStatusChartData()" [options]="chartOptions"></p-chart>
        </p-card>

        <p-card header="Leads por Município (Top 10)" styleClass="chart-card">
          <p-chart type="bar" [data]="leadsMunicipioChartData()" [options]="barChartOptions"></p-chart>
        </p-card>

        <p-card header="Área por Cultura" styleClass="chart-card">
          <p-chart type="doughnut" [data]="areaCulturaChartData()" [options]="chartOptions"></p-chart>
        </p-card>
      </div>

      <!-- Listas -->
      <div class="lists-grid">
        <p-card header="Leads Prioritários" subheader="Área > 100 hectares" styleClass="list-card">
          <p-table [value]="priorityLeads()" [tableStyle]="{ 'min-width': '100%' }">
            <ng-template pTemplate="header">
              <tr>
                <th>Nome</th>
                <th>Município</th>
                <th>Área Total</th>
                <th>Ações</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-lead>
              <tr>
                <td>
                  <div class="lead-info">
                    <i class="pi pi-star-fill text-warning"></i>
                    <strong>{{ lead.name }}</strong>
                  </div>
                </td>
                <td>{{ lead.city }}</td>
                <td>{{ lead.totalAreaHectares || 0 }} ha</td>
                <td>
                  <p-button 
                    icon="pi pi-eye" 
                    [text]="true" 
                    size="small"
                    [routerLink]="['/leads', lead.id]">
                  </p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4">
                  <app-empty-state
                    icon="pi pi-star"
                    title="Nenhum lead prioritário"
                    message="Não há leads com área superior a 100 hectares.">
                  </app-empty-state>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card header="Leads Recentes" subheader="Últimos 7 dias" styleClass="list-card">
          <p-table [value]="recentLeads()" [tableStyle]="{ 'min-width': '100%' }">
            <ng-template pTemplate="header">
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Cadastrado em</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-lead>
              <tr>
                <td><strong>{{ lead.name }}</strong></td>
                <td><app-status-badge [status]="lead.status"></app-status-badge></td>
                <td>{{ lead.createdAt | date: 'dd/MM/yyyy' }}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="3">
                  <app-empty-state
                    icon="pi pi-calendar"
                    title="Nenhum lead recente"
                    message="Não há leads cadastrados nos últimos 7 dias.">
                  </app-empty-state>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>

      <!-- Alerta de Leads sem Contato -->
      <p-card 
        *ngIf="leadsWithoutContact().length > 0" 
        styleClass="alert-card warning">
        <div class="alert-content">
          <i class="pi pi-exclamation-triangle"></i>
          <div>
            <h3>Atenção!</h3>
            <p>Há <strong>{{ leadsWithoutContact().length }} leads</strong> sem contato há mais de 30 dias.</p>
          </div>
          <p-button 
            label="Ver Leads" 
            icon="pi pi-arrow-right"
            [outlined]="true"
            routerLink="/leads">
          </p-button>
        </div>
      </p-card>
    </div>

    <ng-template #loadingSkeleton>
      <div class="metrics-grid">
        <p-skeleton height="120px" *ngFor="let i of [1,2,3,4]"></p-skeleton>
      </div>
    </ng-template>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-color);
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: var(--text-color-secondary);
      margin: 0;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .lists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    /* Melhorar destaque dos cards */
    :host ::ng-deep .p-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    :host ::ng-deep .p-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    :host ::ng-deep .chart-card {
      background: linear-gradient(to bottom, #ffffff, #fafbfc);
    }

    :host ::ng-deep .list-card {
      background: #ffffff;
    }

    :host ::ng-deep .chart-card canvas {
      max-height: 300px;
    }

    :host ::ng-deep .p-card .p-card-title {
      color: var(--text-color);
      font-weight: 700;
      font-size: 1.125rem;
    }

    :host ::ng-deep .p-card .p-card-subtitle {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .lead-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .text-warning {
      color: #F59E0B;
    }

    :host ::ng-deep .alert-card {
      border-left: 4px solid #F59E0B;
      background: #FFF8E1;
    }

    .alert-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .alert-content i {
      font-size: 2.5rem;
      color: #F59E0B;
    }

    .alert-content h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.25rem;
    }

    .alert-content p {
      margin: 0;
      color: var(--text-color-secondary);
    }

    @media (max-width: 768px) {
      .metrics-grid,
      .charts-grid,
      .lists-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private logger = inject(LoggerService);

  // Signals para gerenciamento de estado
  loadingMetrics = signal(true);
  loadingCharts = signal(true);
  metrics = signal<DashboardMetrics | null>(null);
  priorityLeads = signal<Lead[]>([]);
  recentLeads = signal<Lead[]>([]);
  leadsWithoutContact = signal<Lead[]>([]);
  leadsStatusChartData = signal<any>(null);
  leadsMunicipioChartData = signal<any>(null);
  areaCulturaChartData = signal<any>(null);

  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  barChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Carrega métricas
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loadingMetrics.set(false);
      },
      error: (error) => {
        this.logger.error('Erro ao carregar métricas', error);
        this.loadingMetrics.set(false);
      }
    });

    // Carrega gráficos
    this.loadCharts();

    // Carrega listas
    this.loadLists();
  }

  loadCharts(): void {
    this.dashboardService.getLeadsByStatus().subscribe({
      next: (data) => this.leadsStatusChartData.set(data),
      error: (error) => this.logger.error('Erro ao carregar gráfico de status', error)
    });

    this.dashboardService.getLeadsByCity().subscribe({
      next: (data) => this.leadsMunicipioChartData.set(data),
      error: (error) => this.logger.error('Erro ao carregar gráfico de cidades', error)
    });

    this.dashboardService.getAreaByCropType().subscribe({
      next: (data) => {
        this.areaCulturaChartData.set(data);
        this.loadingCharts.set(false);
      },
      error: (error) => {
        this.logger.error('Erro ao carregar gráfico de tipos de cultura', error);
        this.loadingCharts.set(false);
      }
    });
  }

  loadLists(): void {
    this.dashboardService.getPriorityLeads().subscribe({
      next: (data) => this.priorityLeads.set(data),
      error: (error) => {
        this.logger.error('Erro ao carregar leads prioritários', error);
        this.priorityLeads.set([]);
      }
    });

    this.dashboardService.getRecentLeads().subscribe({
      next: (data) => this.recentLeads.set(data),
      error: (error) => {
        this.logger.error('Erro ao carregar leads recentes', error);
        this.recentLeads.set([]);
      }
    });

    this.dashboardService.getLeadsWithoutContact().subscribe({
      next: (data) => this.leadsWithoutContact.set(data),
      error: (error) => {
        this.logger.error('Erro ao carregar leads sem contato', error);
        this.leadsWithoutContact.set([]);
      }
    });
  }
}

