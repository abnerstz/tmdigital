import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { LeadsService } from '../../../core/services/leads.service';
import { LoggerService } from '../../../core/services/logger.service';
import { LeadStatus } from '../../../core/models';
import { cpfValidator, phoneValidator } from '../../../shared/utils/validators';
import { CpfMaskDirective } from '../../../shared/directives/cpf-mask.directive';
import { PhoneMaskDirective } from '../../../shared/directives/phone-mask.directive';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    CpfMaskDirective,
    PhoneMaskDirective
  ],
  template: `
    <div class="lead-form-container">
      <div class="form-header">
        <div>
          <h1>{{ isEditMode ? 'Editar Lead' : 'Novo Lead' }}</h1>
          <p class="subtitle">Preencha as informações do produtor rural</p>
        </div>
        <p-button 
          label="Voltar" 
          icon="pi pi-arrow-left" 
          [outlined]="true"
          (onClick)="goBack()">
        </p-button>
      </div>

      <form [formGroup]="leadForm" (ngSubmit)="onSubmit()">
        <p-card header="Dados Pessoais" styleClass="form-card mb-3">
          <div class="form-grid">
            <div class="form-field col-12 md:col-8">
              <label for="name">Nome Completo *</label>
              <input 
                pInputText 
                id="name" 
                formControlName="name"
                placeholder="Nome do produtor rural"
                [class.ng-invalid]="isFieldInvalid('name')">
              <small class="p-error" *ngIf="isFieldInvalid('name')">
                Nome é obrigatório
              </small>
            </div>

            <div class="form-field col-12 md:col-4">
              <label for="cpf">CPF *</label>
              <input 
                pInputText 
                id="cpf" 
                formControlName="cpf"
                appCpfMask
                placeholder="000.000.000-00"
                [class.ng-invalid]="isFieldInvalid('cpf')">
              <small class="p-error" *ngIf="isFieldInvalid('cpf')">
                {{ getErrorMessage('cpf') }}
              </small>
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="email">Email</label>
              <input 
                pInputText 
                id="email" 
                type="email"
                formControlName="email"
                placeholder="email@exemplo.com"
                [class.ng-invalid]="isFieldInvalid('email')">
              <small class="p-error" *ngIf="isFieldInvalid('email')">
                Email inválido
              </small>
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="phone">Telefone/WhatsApp</label>
              <input 
                pInputText 
                id="phone" 
                formControlName="phone"
                appPhoneMask
                placeholder="(00) 00000-0000"
                [class.ng-invalid]="isFieldInvalid('phone')">
            </div>

            <div class="form-field col-12">
              <label for="city">Município *</label>
              <input 
                pInputText 
                id="city" 
                formControlName="city"
                placeholder="Digite o nome do município"
                [class.ng-invalid]="isFieldInvalid('city')">
              <small class="p-error" *ngIf="isFieldInvalid('city')">
                Município é obrigatório
              </small>
            </div>
          </div>
        </p-card>

        <p-card header="Status e Acompanhamento" styleClass="form-card mb-3">
          <div class="form-grid">
            <div class="form-field col-12 md:col-6">
              <label for="status">Status *</label>
              <p-dropdown
                id="status"
                formControlName="status"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o status"
                styleClass="w-full">
              </p-dropdown>
            </div>

            <div class="form-field col-12 md:col-6">
              <label for="firstContactDate">Data do Primeiro Contato</label>
              <p-calendar
                id="firstContactDate"
                formControlName="firstContactDate"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                placeholder="Selecione a data"
                styleClass="w-full">
              </p-calendar>
            </div>

            <div class="form-field col-12">
              <label for="tags">Tags</label>
              <input 
                pInputText
                id="tags"
                formControlName="tagsInput"
                placeholder="Adicione tags separadas por vírgula (ex: orgânico, irrigação)"
                class="w-full">
              <small class="help-text">Use tags para categorizar o lead (ex: orgânico, irrigação, etc.)</small>
            </div>

            <div class="form-field col-12">
              <label for="comments">Comentários/Observações</label>
              <textarea
                pInputTextarea
                id="comments"
                formControlName="comments"
                [rows]="5"
                placeholder="Adicione observações sobre o lead..."
                [maxlength]="500"
                class="w-full">
              </textarea>
              <small class="help-text">
                {{ leadForm.get('comments')?.value?.length || 0 }}/500 caracteres
              </small>
            </div>
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
          <div class="action-buttons-right">
            <p-button 
              label="Salvar e Adicionar Propriedade" 
              icon="pi pi-plus"
              severity="info"
              (onClick)="onSubmit(true)"
              [loading]="loading"
              type="button"
              *ngIf="!isEditMode">
            </p-button>
            <p-button 
              [label]="isEditMode ? 'Atualizar' : 'Salvar'"
              icon="pi pi-check"
              [loading]="loading"
              type="submit">
            </p-button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .lead-form-container {
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

    .md\\:col-4 {
      grid-column: span 4;
    }

    .md\\:col-8 {
      grid-column: span 8;
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

    .action-buttons-right {
      display: flex;
      gap: 0.75rem;
    }


    :host ::ng-deep .p-inputtextarea textarea {
      padding: 0.5rem 0.75rem;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .md\\:col-6,
      .md\\:col-4,
      .md\\:col-8 {
        grid-column: span 12;
      }

      .form-actions {
        flex-direction: column;
      }

      .action-buttons-right {
        width: 100%;
        flex-direction: column;
      }

      .action-buttons-right p-button {
        width: 100%;
      }
    }
  `]
})
export class LeadFormComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private leadsService = inject(LeadsService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private logger = inject(LoggerService);

  leadForm!: FormGroup;
  loading = false;
  isEditMode = false;
  leadId?: string;

  statusOptions = [
    { label: 'Novo', value: LeadStatus.NEW },
    { label: 'Contato Inicial', value: LeadStatus.INITIAL_CONTACT },
    { label: 'Em Negociação', value: LeadStatus.IN_NEGOTIATION },
    { label: 'Convertido', value: LeadStatus.CONVERTED },
    { label: 'Perdido', value: LeadStatus.LOST }
  ];

  ngOnInit(): void {
    this.initializeForm();

    this.leadId = this.route.snapshot.params['id'];
    if (this.leadId && this.leadId !== 'new') {
      this.isEditMode = true;
      this.loadLead(this.leadId);
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  initializeForm(): void {
    this.leadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, cpfValidator()]],
      email: ['', [Validators.email]],
      phone: ['', [phoneValidator()]],
      city: ['', [Validators.required]],
      status: [LeadStatus.NEW, [Validators.required]],
      firstContactDate: [null],
      tagsInput: [''],
      comments: ['', [Validators.maxLength(500)]]
    });
  }

  loadLead(id: string): void {
    this.loading = true;
    this.leadsService.getLeadById(id).subscribe({
      next: (lead) => {
        this.leadForm.patchValue({
          name: lead.name,
          cpf: lead.cpf,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          status: lead.status,
          firstContactDate: lead.firstContactDate ? new Date(lead.firstContactDate) : null,
          tagsInput: lead.tags?.join(', ') || '',
          comments: lead.comments
        });
        this.loading = false;
      },
      error: (error) => {
        this.logger.error('Erro ao carregar lead', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar o lead'
        });
        this.loading = false;
        this.goBack();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.leadForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.leadForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['cpf']) return field.errors['cpf'].message || 'CPF inválido';
      if (field.errors['phone']) return 'Telefone inválido';
      if (field.errors['minlength']) return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  onSubmit(andAddProperty = false): void {
    if (this.leadForm.invalid) {
      Object.keys(this.leadForm.controls).forEach(key => {
        this.leadForm.get(key)?.markAsDirty();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
      return;
    }

    this.loading = true;
    const tagsArray = this.leadForm.value.tagsInput 
      ? this.leadForm.value.tagsInput.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      : [];
    
    const formData = {
      ...this.leadForm.value,
      tags: tagsArray
    };
    delete formData.tagsInput;

    const operation = this.isEditMode
      ? this.leadsService.updateLead(this.leadId!, formData)
      : this.leadsService.createLead(formData);

    operation.subscribe({
      next: (lead) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode ? 'Lead atualizado com sucesso' : 'Lead cadastrado com sucesso'
        });
        
        if (andAddProperty) {
          this.router.navigate(['/properties/new'], {
            queryParams: { leadId: lead.id }
          });
        } else {
          this.router.navigate(['/leads']);
        }
      },
      error: (error) => {
        this.logger.error('Erro ao salvar lead', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível salvar o lead'
        });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/leads']);
  }
}

