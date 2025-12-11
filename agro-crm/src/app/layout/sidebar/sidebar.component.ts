import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarModule, PanelMenuModule],
  template: `
    <div class="sidebar-container" [class.collapsed]="!visible">
      <nav class="sidebar-nav">
        <a 
          *ngFor="let item of menuItems" 
          [routerLink]="item.routerLink"
          routerLinkActive="active"
          class="nav-item">
          <i [class]="item.icon"></i>
          <span class="nav-label" *ngIf="visible">{{ item.label }}</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar-container {
      width: 250px;
      height: calc(100vh - 60px);
      background: white;
      border-right: 1px solid var(--surface-border);
      transition: width 0.3s ease;
      overflow-x: hidden;
    }

    .sidebar-container.collapsed {
      width: 70px;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.5rem;
      color: var(--text-color);
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
      cursor: pointer;
    }

    .nav-item:hover {
      background: var(--surface-hover);
      color: var(--primary-color);
    }

    .nav-item.active {
      background: var(--primary-50);
      color: var(--primary-color);
      border-left-color: var(--primary-color);
      font-weight: 600;
    }

    .nav-item i {
      font-size: 1.25rem;
      min-width: 1.25rem;
    }

    .nav-label {
      font-size: 0.95rem;
      white-space: nowrap;
    }

    .sidebar-container.collapsed .nav-label {
      display: none;
    }

    /* Tablet e Mobile - Sidebar overlay */
    @media (max-width: 1024px) {
      .sidebar-container {
        position: fixed;
        left: 0;
        top: 60px;
        z-index: 999;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        width: 250px;
      }

      .sidebar-container:not(.collapsed) {
        transform: translateX(0);
      }

      .sidebar-container.collapsed {
        width: 250px;
      }
    }

    /* Mobile - Ajustes adicionais */
    @media (max-width: 768px) {
      .sidebar-container {
        width: 280px;
        max-width: 80vw;
      }

      .sidebar-container.collapsed {
        width: 280px;
        max-width: 80vw;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() visible = true;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: ['/dashboard']
    },
    {
      label: 'Leads',
      icon: 'pi pi-users',
      routerLink: ['/leads']
    },
    {
      label: 'Propriedades',
      icon: 'pi pi-map-marker',
      routerLink: ['/properties']
    },
    {
      label: 'Áreas de Cultivo	',
      icon: 'pi pi-map',
      routerLink: ['/maps']
    }
  ];
}

