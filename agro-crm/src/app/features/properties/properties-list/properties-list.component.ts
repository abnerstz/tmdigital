import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PropertiesService } from '../../../core/services/properties.service';
import { Property, CropType, PropertyFilters } from '../../../core/models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
  selector: 'app-properties-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    EmptyStateComponent
  ],
  template: `
    <div class="properties-list">
      <div class="page-header">
        <div>
          <h1>Gestão de Propriedades</h1>
          <p class="subtitle">Gerenciamento de propriedades rurais</p>
        </div>
        <p-button 
          label="Nova Propriedade" 
          icon="pi pi-plus"
          routerLink="/properties/new">
        </p-button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="search-input-wrapper flex-1">
            <i class="pi pi-search search-icon"></i>
            <input 
              pInputText 
              type="text" 
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por nome ou município"
              class="w-full search-input">
          </div>

          <p-multiSelect 
            [(ngModel)]="filters.cropType"
            [options]="cropTypeOptions"
            (ngModelChange)="onFilterChange()"
            optionLabel="label"
            optionValue="value"
            placeholder="Cultura"
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
      </div>

      <!-- Tabela -->
      <p-table 
        [value]="loading() ? skeletonData : properties()"
        [loading]="false"
        [lazy]="true"
        [paginator]="!loading()"
        [rows]="pageSize"
        [totalRecords]="loading() ? pageSize : totalRecords()"
        [first]="first"
        (onLazyLoad)="loadProperties($event)"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="!loading()"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} propriedades"
        styleClass="p-datatable-striped"
        [tableStyle]="{'min-width': '60rem'}">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">
              Nome <p-sortIcon field="name"></p-sortIcon>
            </th>
            <th>Lead</th>
            <th pSortableColumn="cropType">
              Cultura <p-sortIcon field="cropType"></p-sortIcon>
            </th>
            <th pSortableColumn="areaHectares">
              Área (ha) <p-sortIcon field="areaHectares"></p-sortIcon>
            </th>
            <th pSortableColumn="city">
              Município <p-sortIcon field="city"></p-sortIcon>
            </th>
            <th>Ações</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-prop let-rowIndex="rowIndex">
          <tr [class.skeleton-row]="loading()">
            <td>
              <strong *ngIf="!loading()">{{ prop.name || 'Sem nome' }}</strong>
              <div class="skeleton skeleton-text" style="width: 60%;" *ngIf="loading()"></div>
            </td>
            <td>
              <a [routerLink]="['/leads', prop.leadId]" *ngIf="!loading()">Ver Lead</a>
              <div class="skeleton skeleton-text" style="width: 50%;" *ngIf="loading()"></div>
            </td>
            <td>
              <p-tag [value]="getCropTypeLabel(prop.cropType)" *ngIf="!loading()"></p-tag>
              <div class="skeleton skeleton-badge" style="width: 70px;" *ngIf="loading()"></div>
            </td>
            <td class="text-right">
              <strong *ngIf="!loading()">{{ prop.areaHectares }} ha</strong>
              <div class="skeleton skeleton-text" style="width: 60px; margin-left: auto;" *ngIf="loading()"></div>
            </td>
            <td>
              <span *ngIf="!loading()">{{ prop.city }}</span>
              <div class="skeleton skeleton-text" style="width: 50%;" *ngIf="loading()"></div>
            </td>
            <td>
              <div class="action-buttons" *ngIf="!loading()">
                <p-button 
                  icon="pi pi-eye" 
                  [text]="true"
                  [rounded]="true"
                  severity="info"
                  pTooltip="Visualizar"
                  [routerLink]="['/properties', prop.id]">
                </p-button>
                <p-button 
                  icon="pi pi-pencil" 
                  [text]="true"
                  [rounded]="true"
                  severity="secondary"
                  pTooltip="Editar"
                  [routerLink]="['/properties', prop.id, 'edit']">
                </p-button>
                <p-button 
                  icon="pi pi-trash" 
                  [text]="true"
                  [rounded]="true"
                  severity="danger"
                  pTooltip="Excluir"
                  (onClick)="confirmDelete(prop)">
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
            <td colspan="6" class="text-center">
              <app-empty-state
                icon="pi pi-map-marker"
                title="Nenhuma propriedade encontrada"
                message="Não há propriedades cadastradas com os filtros aplicados.">
              </app-empty-state>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .properties-list {
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

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr auto;
      gap: 1rem;
      align-items: center;
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

    .action-buttons {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
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
    }
  `]
})
export class PropertiesListComponent implements OnInit {
  private propertiesService = inject(PropertiesService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private logger = inject(LoggerService);
  private destroyRef = inject(DestroyRef);

  properties = signal<Property[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  skeletonData: any[] = Array(5).fill({});

  filters: PropertyFilters = {
    searchTerm: undefined,
    cropType: [],
    city: [],
    areaMin: undefined,
    areaMax: undefined
  };

  searchTerm = '';
  first = 0;
  pageSize = 10;
  sortField: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  private searchSubject = new Subject<string>();

  cropTypeOptions = [
    { label: 'Soja', value: CropType.SOJA },
    { label: 'Milho', value: CropType.MILHO },
    { label: 'Algodão', value: CropType.ALGODAO },
    { label: 'Outros', value: CropType.OUTROS }
  ];

  ngOnInit(): void {
    this.loadData();
    
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((searchTerm: string) => {
      this.searchTerm = searchTerm;
      this.filters.searchTerm = searchTerm || undefined;
      this.first = 0;
      this.onFilterChange();
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  loadData(): void {
    this.loading.set(true);
    
    const pagination = {
      page: Math.floor(this.first / this.pageSize),
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    };

    this.propertiesService.getProperties(this.filters, pagination).subscribe({
      next: (response) => {
        this.properties.set(response.data);
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.logger.error('Erro ao carregar propriedades', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as propriedades'
        });
        this.properties.set([]);
        this.totalRecords.set(0);
        this.loading.set(false);
      }
    });
  }

  loadProperties(event: any): void {
    this.first = event.first;
    this.pageSize = event.rows;
    
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }
    
    this.loadData();
  }

  onFilterChange(): void {
    this.first = 0;
    this.loadData();
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: undefined,
      cropType: [],
      city: [],
      areaMin: undefined,
      areaMax: undefined
    };
    this.searchTerm = '';
    this.onFilterChange();
  }

  getCropTypeLabel(cropType: CropType): string {
    const labels: Record<CropType, string> = {
      [CropType.SOJA]: 'Soja',
      [CropType.MILHO]: 'Milho',
      [CropType.ALGODAO]: 'Algodão',
      [CropType.OUTROS]: 'Outros'
    };
    return labels[cropType] || cropType;
  }

  confirmDelete(property: Property): void {
    const message = `Tem certeza que deseja excluir a propriedade ${property.name || 'sem nome'}?`;

    this.confirmationService.confirm({
      message,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteProperty(property.id);
      }
    });
  }

  deleteProperty(id: string): void {
    this.propertiesService.deleteProperty(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Propriedade excluída com sucesso'
        });
        this.loadData();
      },
      error: (error) => {
        this.logger.error('Erro ao excluir propriedade', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir a propriedade'
        });
      }
    });
  }
}
