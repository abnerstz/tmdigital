import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-header (toggleSidebar)="toggleSidebar()"></app-header>
      
      <div class="layout-body">
        <app-sidebar [visible]="sidebarVisible()"></app-sidebar>
        
        <!-- Backdrop para mobile/tablet -->
        <div 
          class="sidebar-backdrop" 
          [class.show]="sidebarVisible() && isMobileView()"
          (click)="closeSidebar()">
        </div>
        
        <main class="main-content" [class.sidebar-collapsed]="!sidebarVisible()">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
    }

    .layout-body {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .sidebar-backdrop {
      display: none;
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .sidebar-backdrop.show {
      display: block;
      opacity: 1;
      pointer-events: auto;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      background: var(--surface-ground);
      transition: margin-left 0.3s ease;
    }

    .content-wrapper {
      padding: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
    }

    /* Desktop - sidebar sempre visível */
    @media (min-width: 1025px) {
      .sidebar-backdrop {
        display: none !important;
      }
    }

    /* Tablet */
    @media (max-width: 1024px) {
      .content-wrapper {
        padding: 1.5rem;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .content-wrapper {
        padding: 1rem;
      }
    }

    /* Mobile pequeno */
    @media (max-width: 480px) {
      .content-wrapper {
        padding: 0.75rem;
      }
    }
  `]
})
export class MainLayoutComponent {
  sidebarVisible = signal(true);

  toggleSidebar(): void {
    this.sidebarVisible.update(value => !value);
  }

  closeSidebar(): void {
    if (this.isMobileView()) {
      this.sidebarVisible.set(false);
    }
  }

  isMobileView(): boolean {
    return window.innerWidth <= 1024;
  }
}

