import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ToolbarModule, ButtonModule, AvatarModule, MenuModule],
  template: `
    <p-toolbar styleClass="app-header">
      <div class="p-toolbar-group-start">
        
        <div class="logo" routerLink="/dashboard">
          <img src="/logo.png" alt="Agro CRM" class="logo-image">
        </div>
        <div class="menu-toggle">
          <p-button 
            icon="pi pi-bars" 
            [text]="true" 
            (onClick)="toggleSidebar.emit()"
          >
          </p-button>
        </div>
      </div>

      <div class="p-toolbar-group-end">
        <div class="user-info" *ngIf="currentUser">
          <p-avatar 
            [label]="getUserInitials()" 
            styleClass="mr-2" 
            [style]="{ 'background-color': '#6047DA', color: '#ffffff' }">
          </p-avatar>
          <div class="user-details">
            <span class="user-name">{{ currentUser.nome }}</span>
            <span class="user-role">{{ getRoleLabel(currentUser.role) }}</span>
          </div>
        </div>
        <p-button 
          icon="pi pi-sign-out" 
          [text]="true"
          severity="danger"
          (onClick)="logout()"
          pTooltip="Sair"
          tooltipPosition="bottom">
        </p-button>
      </div>
    </p-toolbar>
  `,
  styles: [`
    :host ::ng-deep .app-header {
      border-bottom: 1px solid var(--surface-border);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      background: white;
      padding: 0.5rem 1.5rem;
    }

    :host ::ng-deep .app-header .p-toolbar-group-start,
    :host ::ng-deep .app-header .p-toolbar-group-end {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .menu-toggle {
      display: none !important;
    }

    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .logo:hover {
      opacity: 0.8;
    }

    .logo-image {
      height: 2.5rem;
      width: auto;
      object-fit: contain;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-right: 0.75rem;
      padding-right: 0.75rem;
      border-right: 1px solid var(--surface-border);
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
      line-height: 1.2;
      white-space: nowrap;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      white-space: nowrap;
    }

    /* Tablets */
    @media (max-width: 1024px) {
      .menu-toggle {
        display: inline-flex !important;
      }
      :host ::ng-deep .app-header {
        padding: 0.5rem 1rem;
      }

      .logo-image {
        height: 2rem;
      }

      .user-details {
        display: none;
      }

      .user-info {
        margin-right: 0.5rem;
        padding-right: 0.5rem;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {

      :host ::ng-deep .app-header {
        padding: 0.5rem 0.75rem;
      }

      .logo-image {
        height: 1.75rem;
      }

      .user-info {
        margin-right: 0.25rem;
        padding-right: 0.25rem;
        border-right: none;
      }

      :host ::ng-deep .user-info .p-avatar {
        width: 2rem;
        height: 2rem;
        font-size: 0.875rem;
      }
    }

    /* Mobile pequeno */
    @media (max-width: 480px) {
      :host ::ng-deep .app-header {
        padding: 0.5rem;
      }

      .logo {
        gap: 0.5rem;
      }
    }
  `]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: User | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const names = this.currentUser.nome.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return this.currentUser.nome.substring(0, 2).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'admin': 'Administrador',
      'vendedor': 'Vendedor'
    };
    return labels[role] || role;
  }

  logout(): void {
    this.authService.logout();
  }
}

