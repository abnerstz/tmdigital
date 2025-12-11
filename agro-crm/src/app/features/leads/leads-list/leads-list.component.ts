import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LeadsService } from '../../../core/services/leads.service';
import { IbgeService } from '../../../core/services/ibge.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Lead, LeadStatus, LeadFilters, City } from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CpfPipe } from '../../../shared/pipes/cpf.pipe';
import { PhonePipe } from '../../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    SliderModule,
    ConfirmDialogModule,
    TooltipModule,
    StatusBadgeComponent,
    CpfPipe,
    PhonePipe
  ],
  template: `
    <div class="leads-list">
      <div class="page-header">
        <div>
          <h1>Gestão de Leads</h1>
          <p class="subtitle">Gerenciamento completo de leads e contatos</p>
        </div>
        <div class="header-actions">
          <p-button 
            label="Exportar" 
            icon="pi pi-download" 
            [outlined]="true"
            (onClick)="exportLeads()">
          </p-button>
          <p-button 
            label="Novo Lead" 
            icon="pi pi-plus"
            routerLink="/leads/new">
          </p-button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="search-input-wrapper flex-1">
            <i class="pi pi-search search-icon"></i>
            <input 
              pInputText 
              type="text" 
              [(ngModel)]="searchInputValue"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por nome ou CPF"
              class="w-full search-input">
          </div>

          <p-multiSelect 
            [(ngModel)]="filters.status"
            [options]="statusOptions"
            (ngModelChange)="onFilterChange()"
            optionLabel="label"
            optionValue="value"
            placeholder="Status"
            [showClear]="true"
            styleClass="w-full">
          </p-multiSelect>

          <p-multiSelect 
            [(ngModel)]="filters.city"
            [options]="cities()"
            (ngModelChange)="onFilterChange()"
            optionLabel="nome"
            optionValue="nome"
            [filter]="true"
            placeholder="Município"
            [showClear]="true"
            styleClass="w-full">
          </p-multiSelect>

          <p-button 
            label="Limpar Filtros" 
            icon="pi pi-filter-slash" 
            [outlined]="true"
            (onClick)="clearFilters()">
          </p-button>
        </div>

        <!-- Filtro de Área -->
        <div class="area-filter" *ngIf="showAreaFilter">
          <label>Área (hectares): {{ filters.areaMin || 0 }} - {{ filters.areaMax || 1000 }}+ ha</label>
          <p-slider 
            [(ngModel)]="areaRange"
            [range]="true"
            [min]="0"
            [max]="1000"
            (ngModelChange)="onAreaRangeChange()">
          </p-slider>
        </div>
      </div>

      <!-- Tabela -->
      <p-table 
        [value]="loading() ? skeletonData : leads()"
        [loading]="false"
        [lazy]="true"
        [paginator]="!loading()"
        [rows]="pageSize"
        [totalRecords]="loading() ? pageSize : totalRecords()"
        [first]="first"
        (onLazyLoad)="loadLeads($event)"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="!loading()"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} leads"
        styleClass="p-datatable-striped"
        [tableStyle]="{'min-width': '60rem'}">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">
              Nome <p-sortIcon field="name"></p-sortIcon>
            </th>
            <th>CPF</th>
            <th pSortableColumn="status">
              Status <p-sortIcon field="status"></p-sortIcon>
            </th>
            <th>Município</th>
            <th>Telefone</th>
            <th>Propriedades</th>
            <th>Área Total</th>
            <th>Ações</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-rowData let-rowIndex="rowIndex">
          <tr [class.skeleton-row]="loading()">
            <td>
              <div class="lead-name" *ngIf="!loading()">
                <i class="pi pi-star-fill text-warning" 
                   *ngIf="isPriority(rowData)"
                   pTooltip="Lead Prioritário"
                   tooltipPosition="top"></i>
                <strong>{{ rowData.name }}</strong>
              </div>
              <div class="skeleton skeleton-text" style="width: 60%;" *ngIf="loading()"></div>
            </td>
            <td>
              <span *ngIf="!loading()">{{ rowData.cpf | cpf }}</span>
              <div class="skeleton skeleton-text" style="width: 80%;" *ngIf="loading()"></div>
            </td>
            <td>
              <app-status-badge [status]="rowData.status" *ngIf="!loading()"></app-status-badge>
              <div class="skeleton skeleton-badge" style="width: 70px;" *ngIf="loading()"></div>
            </td>
            <td>
              <span *ngIf="!loading()">{{ rowData.city }}</span>
              <div class="skeleton skeleton-text" style="width: 50%;" *ngIf="loading()"></div>
            </td>
            <td>
              <span *ngIf="!loading()">{{ rowData.phone | phone }}</span>
              <div class="skeleton skeleton-text" style="width: 70%;" *ngIf="loading()"></div>
            </td>
            <td class="text-center">
              <span class="badge-count" *ngIf="!loading()">{{ rowData.properties?.length || 0 }}</span>
              <div class="skeleton skeleton-badge" style="width: 30px; margin: 0 auto;" *ngIf="loading()"></div>
            </td>
            <td class="text-right">
              <strong *ngIf="!loading()">{{ rowData.totalAreaHectares || 0 }} ha</strong>
              <div class="skeleton skeleton-text" style="width: 60px; margin-left: auto;" *ngIf="loading()"></div>
            </td>
            <td>
              <div class="action-buttons" *ngIf="!loading()">
                <p-button 
                  icon="pi pi-eye" 
                  [text]="true"
                  [rounded]="true"
                  severity="info"
                  pTooltip="Visualizar"
                  [routerLink]="['/leads', rowData.id]">
                </p-button>
                <p-button 
                  icon="pi pi-pencil" 
                  [text]="true"
                  [rounded]="true"
                  severity="secondary"
                  pTooltip="Editar"
                  [routerLink]="['/leads', rowData.id, 'edit']">
                </p-button>
                <p-button 
                  icon="pi pi-trash" 
                  [text]="true"
                  [rounded]="true"
                  severity="danger"
                  pTooltip="Excluir"
                  (onClick)="confirmDelete(rowData)">
                </p-button>
              </div>
              <div class="skeleton skeleton-buttons" *ngIf="loading()">
                <div class="skeleton skeleton-button"></div>
                <div class="skeleton skeleton-button"></div>
                <div class="skeleton skeleton-button"></div>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr *ngIf="!loading()">
            <td colspan="8" class="text-center">
              <div class="empty-state">
                <i class="pi pi-users empty-icon"></i>
                <h3>Nenhum lead encontrado</h3>
                <p>Não há leads cadastrados com os filtros aplicados.</p>
                <p-button 
                  label="Cadastrar Primeiro Lead" 
                  icon="pi pi-plus"
                  routerLink="/leads/new">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .leads-list {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 1rem;
      align-items: center;
    }

    :host ::ng-deep .p-multiselect {
      position: relative;
      display: flex;
      align-items: center;
      min-height: 2.5rem;
      width: 100%;
    }

    :host ::ng-deep .p-multiselect .p-multiselect-label-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      min-height: 2.5rem;
    }

    :host ::ng-deep .p-multiselect .p-multiselect-label {
      display: flex;
      align-items: center;
      width: 100%;
      flex: 1;
      padding-right: 3rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host ::ng-deep .p-multiselect .p-multiselect-trigger {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      z-index: 1;
      flex-shrink: 0;
    }

    :host ::ng-deep .p-multiselect .p-multiselect-clear-icon {
      position: absolute;
      right: 2.5rem;
      top: 50%;
      transform: translateY(-50%);
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      z-index: 1;
      flex-shrink: 0;
    }

    :host ::ng-deep .p-multiselect .p-multiselect-label-container .p-multiselect-token {
      display: inline-flex;
      align-items: center;
      margin-right: 0.25rem;
    }

    .area-filter {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-border);
    }

    .area-filter label {
      display: block;
      margin-bottom: 1rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .lead-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .text-warning {
      color: #F59E0B;
    }

    .badge-count {
      background: var(--primary-100);
      color: var(--primary-700);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
    }

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      color: var(--surface-400);
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-color-secondary);
      margin-bottom: 1.5rem;
    }


    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: var(--text-color-secondary);
      z-index: 1;
      pointer-events: none;
    }

    .search-input {
      padding-left: 2.5rem !important;
    }

    .skeleton-row {
      background: white !important;
    }

    .skeleton-row:hover {
      background: white !important;
      transform: none !important;
    }

    .skeleton-row td {
      padding: 0.875rem 1rem !important;
      vertical-align: middle;
    }

    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      border-radius: 4px;
      height: 1rem;
      display: inline-block;
    }

    .skeleton-text {
      height: 1rem;
    }

    .skeleton-badge {
      height: 1.5rem;
      border-radius: 12px;
    }

    .skeleton-buttons {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      align-items: center;
    }

    .skeleton-button {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
    }

    @keyframes skeleton-loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions p-button {
        flex: 1;
      }
    }
  `]
})
export class LeadsListComponent implements OnInit {
  private leadsService = inject(LeadsService);
  private ibgeService = inject(IbgeService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private logger = inject(LoggerService);
  private destroyRef = inject(DestroyRef);

  leads = signal<Lead[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  cities = signal<City[]>([]);
  
  skeletonData: any[] = Array(5).fill({});

  filters: LeadFilters = {
    searchTerm: '',
    status: [] as LeadStatus[],
    city: [] as string[],
    areaMin: undefined,
    areaMax: undefined
  };

  searchInputValue = '';

  areaRange: number[] = [0, 1000];
  showAreaFilter = false;

  first = 0;
  pageSize = 10;
  sortField: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  private searchSubject = new Subject<string>();

  statusOptions = [
    { label: 'Novo', value: LeadStatus.NEW },
    { label: 'Contato Inicial', value: LeadStatus.INITIAL_CONTACT },
    { label: 'Em Negociação', value: LeadStatus.IN_NEGOTIATION },
    { label: 'Convertido', value: LeadStatus.CONVERTED },
    { label: 'Perdido', value: LeadStatus.LOST }
  ];

  ngOnInit(): void {
    this.loadCities();
    this.loading.set(true);
    this.loadLeadsData();
    
    this.searchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((searchTerm: string) => {
      this.filters.searchTerm = searchTerm || '';
      this.first = 0;
      this.loadLeadsData();
    });
  }

  loadCities(): void {
    this.ibgeService.getCitiesMG().subscribe({
      next: (data: City[]) => this.cities.set(data),
      error: (error: any) => {
        this.logger.error('Erro ao carregar cidades', error);
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm || '');
  }

  loadLeadsData(): void {
    this.loading.set(true);
    
    const pagination = {
      page: Math.floor(this.first / this.pageSize),
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    };

    this.leadsService.getLeads(this.filters, pagination).subscribe({
      next: (response) => {
        this.leads.set(response.data);
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.logger.error('Erro ao carregar leads', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os leads'
        });
        this.leads.set([]);
        this.totalRecords.set(0);
        this.loading.set(false);
      }
    });
  }

  loadLeads(event: any): void {
    this.first = event.first;
    this.pageSize = event.rows;
    
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }
    
    this.loadLeadsData();
  }

  onFilterChange(): void {
    this.first = 0;
    this.loadLeadsData();
  }

  onAreaRangeChange(): void {
    this.filters.areaMin = this.areaRange[0];
    this.filters.areaMax = this.areaRange[1];
    this.onFilterChange();
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: '',
      status: [],
      city: [],
      areaMin: undefined,
      areaMax: undefined
    };
    this.searchInputValue = '';
    this.areaRange = [0, 1000];
    this.showAreaFilter = false;
    this.onFilterChange();
  }

  isPriority(lead: Lead): boolean {
    return (lead.totalAreaHectares || 0) > 100;
  }

  confirmDelete(lead: Lead): void {
    const propertiesCount = lead.properties?.length || 0;
    const message = propertiesCount > 0
      ? `Tem certeza que deseja excluir o lead ${lead.name}? Isso afetará ${propertiesCount} propriedade(s) vinculada(s).`
      : `Tem certeza que deseja excluir o lead ${lead.name}?`;

    this.confirmationService.confirm({
      message,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteLead(lead.id);
      }
    });
  }

  deleteLead(id: string): void {
    this.leadsService.deleteLead(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Lead excluído com sucesso'
        });
        this.loadLeadsData();
      },
      error: (error) => {
        this.logger.error('Erro ao excluir lead', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir o lead'
        });
      }
    });
  }

  exportLeads(): void {
    this.leadsService.exportLeads('excel', this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Leads exportados com sucesso'
        });
      },
      error: (error) => {
        this.logger.error('Erro ao exportar leads', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível exportar os leads'
        });
      }
    });
  }
}

