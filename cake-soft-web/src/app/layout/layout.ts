import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToolbarModule, ButtonModule, DrawerModule, MenuModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="layout-wrap">

      <header class="layout-header">
        <div class="header-left">
          <p-button icon="pi pi-bars" (click)="sidebarVisible = true" [text]="true" [rounded]="true" severity="secondary"></p-button>
          <a class="brand" routerLink="/">
            <i class="pi pi-box"></i>
            <span>CakeSoft</span>
          </a>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
            <span class="user-role">{{ authService.currentUser()?.role }}</span>
          </div>
          <a class="avatar" routerLink="/profile" title="Hồ sơ">
            {{ authService.currentUser()?.fullName?.charAt(0)?.toUpperCase() || 'U' }}
          </a>
          <p-button icon="pi pi-sign-out" [rounded]="true" [text]="true" severity="danger"
            (click)="onLogout()" pTooltip="Đăng xuất">
          </p-button>
        </div>
      </header>


      <p-drawer [(visible)]="sidebarVisible" [style]="{ width: '280px' }">
        <ng-template pTemplate="header">
          <div class="drawer-brand">
            <i class="pi pi-box"></i>
            <span>CakeSoft Menu</span>
          </div>
        </ng-template>
        <nav class="drawer-nav">
          @for (item of menuItems(); track item.label) {
            <a [routerLink]="item.routerLink" (click)="sidebarVisible = false" class="nav-link hover-lift">
              <i [class]="item.icon + ' nav-icon'"></i>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </p-drawer>


      <main class="layout-main">
        <router-outlet></router-outlet>
      </main>
    </div>
    <p-toast position="top-right" [life]="3000"></p-toast>
  `,
  styles: [`
    .layout-wrap {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f8fafc;
    }


    .layout-header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #fecdd3;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      padding: 0.6rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #e11d48;
      text-decoration: none;
      cursor: pointer;
    }
    .brand i { font-size: 1.7rem; }
    .brand span { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      text-align: right;
    }
    .user-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
    .user-role { font-size: 0.7rem; color: #e11d48; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

    .avatar {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffe4e6, #fed7aa);
      border: 1.5px solid #fecdd3;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e11d48;
      font-weight: 800;
      font-size: 0.875rem;
      cursor: pointer;
      transition: box-shadow 0.2s;
      text-decoration: none;
    }
    .avatar:hover { box-shadow: 0 4px 12px rgba(225,29,72,0.25); }


    .drawer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #e11d48;
      font-weight: 700;
      font-size: 1.1rem;
    }
    .drawer-brand i { font-size: 1.3rem; }

    .drawer-nav {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 1.25rem 0.5rem 0;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.8rem 1rem;
      border-radius: 0.875rem;
      color: #475569;
      font-weight: 500;
      font-size: 0.975rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      text-decoration: none;
    }
    .nav-link:hover {
      background: #fef2f2;
      color: #e11d48;
    }
    .nav-icon { font-size: 1.15rem; }


    .layout-main {
      flex: 1;
      padding: 1.5rem;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      overflow: auto;
    }

    @media (max-width: 640px) {
      .user-info { display: none; }
      .layout-main { padding: 1rem; }
    }
  `]
})
export class LayoutComponent {
  sidebarVisible = false;

  constructor(public authService: AuthService, private router: Router) {}

  menuItems = computed<MenuItem[]>(() => {
    const role = this.authService.currentUser()?.role;
    const items: MenuItem[] = [
      { label: 'Bảng điều khiển', icon: 'pi pi-home', routerLink: '/' }
    ];

    if (role === 'Admin') {
      items.push({ label: 'Quản lý Bánh', icon: 'pi pi-box', routerLink: '/cakes' });
      items.push({ label: 'Lịch sử Hóa đơn', icon: 'pi pi-list', routerLink: '/admin/invoices' });
      items.push({ label: 'Quản lý Người dùng', icon: 'pi pi-users', routerLink: '/admin/users' });
    } else {
      items.push({ label: 'POS - Đặt bánh', icon: 'pi pi-shopping-cart', routerLink: '/employee/pos' });
      items.push({ label: 'Hóa đơn của tôi', icon: 'pi pi-receipt', routerLink: '/employee/invoices' });
    }

    return items;
  });

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
