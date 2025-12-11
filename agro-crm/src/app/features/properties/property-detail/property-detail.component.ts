import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { PropertiesService } from '../../../core/services/properties.service';
import { LeadsService } from '../../../core/services/leads.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Property, CropType } from '../../../core/models';
import { CpfPipe } from '../../../shared/pipes/cpf.pipe';
import { PhonePipe } from '../../../shared/pipes/phone.pipe';
import { MapDrawerComponent } from '../../../shared/components/map-drawer/map-drawer.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    CpfPipe,
    PhonePipe,
    MapDrawerComponent
  ],
  template: `
    <div class="property-detail" *ngIf="property; else loadingTemplate">
      <div class="page-header">
        <div>
          <h1>{{ property.name || 'Propriedade sem nome' }}</h1>
          <p class="subtitle">Detalhes da Propriedade</p>
        </div>
        <div class="header-actions">
          <p-button 
            label="Voltar" 
            icon="pi pi-arrow-left" 
            [outlined]="true"
            (onClick)="goBack()">
          </p-button>
          <p-button 
            label="Editar" 
            icon="pi pi-pencil"
            [routerLink]="['/properties', property.id, 'edit']">
          </p-button>
        </div>
      </div>

      <div class="content-grid">
        <p-card header="Informações da Propriedade" styleClass="info-card">
          <div class="info-row">
            <span class="label">Nome:</span>
            <span class="value"><strong>{{ property.name || '-' }}</strong></span>
          </div>
          <div class="info-row">
            <span class="label">Cultura:</span>
            <span class="value"><p-tag [value]="getCropTypeLabel(property.cropType)"></p-tag></span>
          </div>
          <div class="info-row">
            <span class="label">Área:</span>
            <span class="value"><strong>{{ property.areaHectares }} ha</strong></span>
          </div>
          <div class="info-row">
            <span class="label">Município:</span>
            <span class="value">{{ property.city }}</span>
          </div>
        </p-card>

        <p-card header="Lead Vinculado" styleClass="info-card" *ngIf="lead">
          <div class="info-row">
            <span class="label">Nome:</span>
            <span class="value"><strong>{{ lead.name }}</strong></span>
          </div>
          <div class="info-row">
            <span class="label">CPF:</span>
            <span class="value">{{ lead.cpf | cpf }}</span>
          </div>
          <div class="info-row">
            <span class="label">Município:</span>
            <span class="value">{{ lead.city }}</span>
          </div>
          <div class="info-row">
            <span class="label">Telefone:</span>
            <span class="value">{{ lead.phone ? (lead.phone | phone) : '-' }}</span>
          </div>
          <div class="card-actions">
            <p-button 
              label="Ver Lead" 
              icon="pi pi-user"
              [outlined]="true"
              [routerLink]="['/leads', lead.id]">
            </p-button>
          </div>
        </p-card>

        <p-card header="Localização da Propriedade" styleClass="full-width" *ngIf="property.geometry">
          <app-map-drawer
            [geometry]="property.geometry"
            [readOnly]="true"
            [initialCenter]="[property.latitude || -18.5122, property.longitude || -44.5550]"
            style="height: 500px; width: 100%;">
          </app-map-drawer>
        </p-card>

        <p-card header="Observações" styleClass="full-width" *ngIf="property.notes">
          <p>{{ property.notes }}</p>
        </p-card>

        <p-card header="Informações do Sistema" styleClass="full-width">
          <div class="info-row">
            <span class="label">Data de Criação:</span>
            <span class="value">{{ property.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Última Atualização:</span>
            <span class="value">{{ property.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
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
    .property-detail {
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
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertiesService = inject(PropertiesService);
  private leadsService = inject(LeadsService);
  private logger = inject(LoggerService);

  property?: Property;
  lead?: any;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadProperty(id);
  }

  loadProperty(id: string): void {
    this.propertiesService.getPropertyById(id).subscribe({
      next: (data) => {
        this.property = data;
        if (data.lead) {
          this.lead = data.lead;
        } else if (data.leadId) {
          this.loadLead(data.leadId);
        }
      },
      error: (error) => {
        this.logger.error('Erro ao carregar propriedade', error);
      }
    });
  }

  loadLead(leadId: string): void {
    this.leadsService.getLeadById(leadId).subscribe({
      next: (data) => {
        this.lead = data;
      },
      error: (error) => {
        this.logger.error('Erro ao carregar lead', error);
      }
    });
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

  goBack(): void {
    if (this.lead) {
      this.router.navigate(['/leads', this.lead.id]);
    } else {
      this.router.navigate(['/properties']);
    }
  }
}
