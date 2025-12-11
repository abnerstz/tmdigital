import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { PropertiesService } from '../../../core/services/properties.service';
import { LeadsService } from '../../../core/services/leads.service';
import { LoggerService } from '../../../core/services/logger.service';
import { CropType, PropertyCreateDto } from '../../../core/models';
import { MapDrawerComponent } from '../../../shared/components/map-drawer/map-drawer.component';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputTextarea,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    MapDrawerComponent
  ],
  template: `
    <div class="property-form-container">
      <div class="form-header">
        <div>
          <h1>{{ isEditMode ? 'Editar Propriedade' : 'Nova Propriedade' }}</h1>
          <p class="subtitle">{{ leadName ? 'Propriedade de ' + leadName : 'Preencha as informações da propriedade' }}</p>
        </div>
        <p-button 
          label="Voltar" 
          icon="pi pi-arrow-left" 
          [outlined]="true"
          (onClick)="goBack()">
        </p-button>
      </div>

      <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()">
        <p-card header="Informações da Propriedade" styleClass="form-card mb-3">
          <div class="form-grid">
            <div class="form-field col-12 md:col-6" *ngIf="!leadIdFromQuery">
              <label for="leadId">Lead *</label>
              <p-dropdown
                id="leadId"
                formControlName="leadId"
                [options]="leads"
                optionLabel="name"
                optionValue="id"
                placeholder="Selecione o lead"
                [filter]="true"
                filterBy="name,cpf"
                styleClass="w-full"
                [class.ng-invalid]="isFieldInvalid('leadId')">
              </p-dropdown>
              <small class="p-error" *ngIf="isFieldInvalid('leadId')">
                Lead é obrigatório
              </small>
            </div>

            <div class="form-field col-12 md:col-6" *ngIf="leadIdFromQuery">
              <label>Lead Vinculado</label>
              <input 
                pInputText 
                [value]="leadName || 'Carregando...'"
                [disabled]="true"
                class="w-full">
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="name">Nome da Propriedade</label>
              <input 
                pInputText 
                id="name" 
                formControlName="name"
                placeholder="Ex: Fazenda Santa Rita"
                class="w-full">
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="cropType">Cultura *</label>
              <p-dropdown
                id="cropType"
                formControlName="cropType"
                [options]="cropTypeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione a cultura"
                styleClass="w-full"
                [class.ng-invalid]="isFieldInvalid('cropType')">
              </p-dropdown>
              <small class="p-error" *ngIf="isFieldInvalid('cropType')">
                Cultura é obrigatória
              </small>
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="areaHectares">Área (hectares) *</label>
              <p-inputNumber
                id="areaHectares"
                formControlName="areaHectares"
                [min]="0.01"
                [max]="999999"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
                placeholder="0.00"
                styleClass="w-full"
                [class.ng-invalid]="isFieldInvalid('areaHectares')">
              </p-inputNumber>
              <small class="p-error" *ngIf="isFieldInvalid('areaHectares')">
                {{ getErrorMessage('areaHectares') }}
              </small>
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="city">Município *</label>
              <input 
                pInputText 
                id="city" 
                formControlName="city"
                placeholder="Digite o nome do município"
                [class.ng-invalid]="isFieldInvalid('city')"
                class="w-full">
              <small class="p-error" *ngIf="isFieldInvalid('city')">
                Município é obrigatório
              </small>
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="latitude">Latitude</label>
              <p-inputNumber
                id="latitude"
                formControlName="latitude"
                [min]="-90"
                [max]="90"
                [minFractionDigits]="6"
                [maxFractionDigits]="8"
                placeholder="Será preenchido automaticamente ao desenhar no mapa"
                [disabled]="true"
                [readonly]="true"
                styleClass="w-full disabled-field">
              </p-inputNumber>
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="longitude">Longitude</label>
              <p-inputNumber
                id="longitude"
                formControlName="longitude"
                [min]="-180"
                [max]="180"
                [minFractionDigits]="6"
                [maxFractionDigits]="8"
                placeholder="Será preenchido automaticamente ao desenhar no mapa"
                [disabled]="true"
                [readonly]="true"
                styleClass="w-full disabled-field">
              </p-inputNumber>
            </div>

            <div class="form-field col-12">
              <label for="notes">Observações</label>
              <textarea
                pInputTextarea
                id="notes"
                formControlName="notes"
                [rows]="5"
                placeholder="Adicione observações sobre a propriedade..."
                [maxlength]="500"
                class="w-full">
              </textarea>
              <small class="help-text">
                {{ propertyForm.get('notes')?.value?.length || 0 }}/500 caracteres
              </small>
            </div>
          </div>
        </p-card>

        <p-card header="Localização da Propriedade" styleClass="form-card mb-3">
          <div class="form-field col-12">
            <label>Desenhe a propriedade no mapa *</label>
            <small class="help-text mb-2" style="display: block;">
              Use as ferramentas de desenho no canto superior direito do mapa para desenhar o polígono ou retângulo da propriedade.
              O município será preenchido automaticamente.
            </small>
            <app-map-drawer
              [geometry]="propertyForm.get('geometry')?.value"
              [readOnly]="false"
              (geometryChange)="onGeometryChange($event)"
              (centerChange)="onCenterChange($event)"
              (cityChange)="onCityChange($event)"
              style="height: 500px; width: 100%;">
            </app-map-drawer>
            <small class="p-error" *ngIf="isFieldInvalid('geometry')" style="display: block; margin-top: 0.5rem;">
              É necessário desenhar a propriedade no mapa.
            </small>
          </div>
        </p-card>

        <div class="form-actions">
          <p-button 
            label="Cancelar" 
            severity="secondary"
            [outlined]="true"
            (onClick)="goBack()"
            type="button">
          </p-button>
          <p-button 
            [label]="isEditMode ? 'Atualizar' : 'Salvar'"
            icon="pi pi-check"
            [loading]="loading"
            type="submit">
          </p-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .property-form-container {
      animation: fadeIn 0.3s ease-in;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .form-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: var(--text-color-secondary);
      margin: 0;
    }

    .form-card {
      margin-bottom: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.5rem;
      min-height: auto;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      min-height: auto;
      opacity: 1;
      visibility: visible;
      height: auto;
    }

    .form-field label {
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .col-12 {
      grid-column: span 12;
    }

    .md\\:col-6 {
      grid-column: span 6;
    }

    .p-error {
      display: block;
      margin-top: 0.25rem;
      color: var(--red-500);
      font-size: 0.875rem;
    }

    .help-text {
      display: block;
      margin-top: 0.25rem;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      border-top: 1px solid var(--surface-border);
      flex-wrap: wrap;
      gap: 1rem;
    }

    :host ::ng-deep .p-inputtextarea textarea {
      padding: 0.5rem 0.75rem;
    }

    :host ::ng-deep .p-inputnumber.p-disabled,
    :host ::ng-deep .p-inputnumber.p-disabled .p-inputnumber-input,
    :host ::ng-deep .p-inputnumber.p-disabled input {
      background-color: var(--gray-100) !important;
      cursor: not-allowed !important;
      opacity: 0.7;
      pointer-events: none;
    }

    :host ::ng-deep .disabled-field.p-inputnumber,
    :host ::ng-deep .disabled-field.p-inputnumber .p-inputnumber-input,
    :host ::ng-deep .disabled-field.p-inputnumber input {
      background-color: var(--gray-100) !important;
      cursor: not-allowed !important;
      opacity: 0.7;
      pointer-events: none;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .md\\:col-6 {
        grid-column: span 12;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PropertyFormComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private propertiesService = inject(PropertiesService);
  private leadsService = inject(LeadsService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private logger = inject(LoggerService);

  propertyForm!: FormGroup;
  loading = false;
  isEditMode = false;
  propertyId?: string;
  leadIdFromQuery?: string;
  leadName?: string;
  leads: any[] = [];

  cropTypeOptions = [
    { label: 'Soja', value: CropType.SOJA },
    { label: 'Milho', value: CropType.MILHO },
    { label: 'Algodão', value: CropType.ALGODAO },
    { label: 'Outros', value: CropType.OUTROS }
  ];

  ngOnInit(): void {
    this.initializeForm();
    
    this.propertyId = this.route.snapshot.params['id'];
    this.leadIdFromQuery = this.route.snapshot.queryParams['leadId'];
    
    if (this.propertyId && this.propertyId !== 'new') {
      this.isEditMode = true;
      this.loadProperty(this.propertyId);
    } else if (this.leadIdFromQuery) {
      this.propertyForm.patchValue({ leadId: this.leadIdFromQuery });
      this.propertyForm.get('leadId')?.disable();
      this.loadLead(this.leadIdFromQuery);
    }
    
    if (!this.leadIdFromQuery) {
      this.loadLeads();
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  initializeForm(): void {
    this.propertyForm = this.fb.group({
      leadId: ['', [Validators.required]],
      name: [''],
      cropType: ['', [Validators.required]],
      areaHectares: [null, [Validators.required, Validators.min(0.01)]],
      city: ['', [Validators.required]],
      latitude: [null],
      longitude: [null],
      geometry: [null, [Validators.required]],
      notes: ['']
    });
  }

  loadProperty(id: string): void {
    this.propertiesService.getPropertyById(id).subscribe({
      next: (property) => {
        this.propertyForm.patchValue({
          leadId: property.leadId,
          name: property.name || '',
          cropType: property.cropType,
          areaHectares: property.areaHectares,
          city: property.city,
          latitude: property.latitude || null,
          longitude: property.longitude || null,
          geometry: property.geometry || null,
          notes: property.notes || ''
        });
        
        if (property.leadId) {
          this.loadLead(property.leadId);
        }
      },
      error: (error) => {
        this.logger.error('Erro ao carregar propriedade', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a propriedade'
        });
      }
    });
  }

  loadLead(leadId: string): void {
    this.leadsService.getLeadById(leadId).subscribe({
      next: (lead) => {
        this.leadName = lead.name;
      },
      error: (error) => {
        this.logger.error('Erro ao carregar lead', error);
      }
    });
  }

  loadLeads(): void {
    this.leadsService.getLeads({}, { page: 0, pageSize: 100 }).subscribe({
      next: (response) => {
        this.leads = response.data.map(lead => ({
          id: lead.id,
          name: `${lead.name} - ${lead.cpf}`
        }));
      },
      error: (error) => {
        this.logger.error('Erro ao carregar leads', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os leads'
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.propertyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.propertyForm.get(fieldName);
    if (!field || !field.errors) return '';
    
    if (field.errors['required']) {
      return 'Campo obrigatório';
    }
    if (field.errors['min']) {
      return 'Valor mínimo: ' + field.errors['min'].min;
    }
    return 'Campo inválido';
  }

  onGeometryChange(geometry: any): void {
    this.propertyForm.patchValue({ geometry });
    if (geometry) {
      this.propertyForm.get('geometry')?.markAsTouched();
    }
  }

  onCenterChange(center: [number, number]): void {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      const latitudeControl = this.propertyForm.get('latitude');
      const longitudeControl = this.propertyForm.get('longitude');
      
      if (latitudeControl && longitudeControl) {
        latitudeControl.setValue(center[0], { emitEvent: false });
        longitudeControl.setValue(center[1], { emitEvent: false });
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    }
  }

  onCityChange(city: string): void {
    this.propertyForm.patchValue({ city });
    if (city) {
      this.propertyForm.get('city')?.markAsTouched();
    }
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    this.loading = true;
    const formValue = this.propertyForm.getRawValue();
    
    const propertyData: PropertyCreateDto = {
      leadId: formValue.leadId,
      name: formValue.name || undefined,
      cropType: formValue.cropType,
      areaHectares: formValue.areaHectares,
      city: formValue.city,
      latitude: formValue.latitude || undefined,
      longitude: formValue.longitude || undefined,
      geometry: formValue.geometry || undefined,
      notes: formValue.notes || undefined
    };

    if (this.isEditMode && this.propertyId) {
      this.propertiesService.updateProperty(this.propertyId, propertyData).subscribe({
        next: (property) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Propriedade atualizada com sucesso'
          });
          this.router.navigate(['/properties', property.id]);
        },
        error: (error) => {
          this.logger.error('Erro ao atualizar propriedade', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível atualizar a propriedade'
          });
          this.loading = false;
        }
      });
    } else {
      this.propertiesService.createProperty(propertyData).subscribe({
        next: (property) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Propriedade criada com sucesso'
          });
          if (this.leadIdFromQuery) {
            this.router.navigate(['/leads', this.leadIdFromQuery]);
          } else {
            this.router.navigate(['/properties', property.id]);
          }
        },
        error: (error) => {
          this.logger.error('Erro ao criar propriedade', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível criar a propriedade'
          });
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    if (this.leadIdFromQuery) {
      this.router.navigate(['/leads', this.leadIdFromQuery]);
    } else if (this.propertyId && this.isEditMode) {
      this.router.navigate(['/properties', this.propertyId]);
    } else {
      this.router.navigate(['/properties']);
    }
  }
}
