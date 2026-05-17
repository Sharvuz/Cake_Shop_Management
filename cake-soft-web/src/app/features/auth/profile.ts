import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" [life]="3000"></p-toast>
    <div class="profile-page">
      <div class="profile-card">


        <div class="profile-title-row">
          <div class="profile-avatar-big">
            {{ fullName.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div>
            <h2 class="profile-title">Hồ sơ cá nhân</h2>
            <p class="profile-sub">Quản lý thông tin tài khoản của bạn</p>
          </div>
        </div>

        <div *ngIf="isLoading" class="profile-loading">
          <i class="pi pi-spin pi-spinner"></i>
        </div>

        <div *ngIf="!isLoading" class="profile-body">
          <div class="info-grid">
            <div class="info-field">
              <label>Tên đăng nhập</label>
              <div class="info-readonly">
                <i class="pi pi-at"></i> {{ profile.username }}
              </div>
            </div>
            <div class="info-field">
              <label>Vai trò</label>
              <div class="info-readonly role">
                <i class="pi pi-shield"></i> {{ profile.role }}
              </div>
            </div>
          </div>

          <div class="info-field mt">
            <label for="fullName">Họ và tên hiển thị</label>
            <input pInputText id="fullName" [(ngModel)]="fullName" class="profile-input" />
          </div>

          <div class="profile-footer">
            <button class="btn-save hover-lift" (click)="onUpdate()" [disabled]="isSaving">
              <i class="pi" [class.pi-check]="!isSaving" [class.pi-spin]="isSaving" [class.pi-spinner]="isSaving"></i>
              {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      display: flex;
      justify-content: center;
      padding: 2.5rem 1rem;
    }

    .profile-card {
      background: #fff;
      border-radius: 1.5rem;
      border: 1px solid #f1f5f9;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      padding: 2.5rem;
      width: 100%;
      max-width: 680px;
    }

    .profile-title-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 1.75rem;
    }

    .profile-avatar-big {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #fecdd3, #fed7aa);
      color: #e11d48;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 800;
      flex-shrink: 0;
      border: 2px solid #fecdd3;
    }

    .profile-title { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin-bottom: 0.2rem; }
    .profile-sub { font-size: 0.85rem; color: #64748b; }

    .profile-loading {
      display: flex;
      justify-content: center;
      padding: 2rem;
      color: #e11d48;
      font-size: 1.5rem;
    }

    .profile-body { display: flex; flex-direction: column; gap: 1.25rem; }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .info-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .info-field.mt { margin-top: 0.25rem; }

    .info-field label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
    }

    .info-readonly {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.625rem;
      color: #64748b;
      font-size: 0.9rem;
    }
    .info-readonly.role {
      background: #fef2f2;
      border-color: #fecdd3;
      color: #be123c;
      font-weight: 600;
    }

    .profile-input {
      padding: 0.75rem 1rem;
      border-radius: 0.625rem;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      font-size: 0.95rem;
      width: 100%;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .profile-input:focus {
      border-color: #e11d48;
      background: #fff;
    }

    .profile-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
      margin-top: 0.5rem;
    }

    .btn-save {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 2rem;
      background: linear-gradient(135deg, #e11d48, #f97316);
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      border: none;
      border-radius: 0.875rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(225,29,72,0.3);
      transition: all 0.2s;
      letter-spacing: 0.02em;
    }
    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(225,29,72,0.4);
    }
    .btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

    @media (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
      .profile-card { padding: 1.5rem; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: any = {};
  isLoading = true;
  isSaving = false;
  fullName = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.fullName = data.fullName;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tải hồ sơ thất bại' });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onUpdate() {
    this.isSaving = true;
    this.cdr.markForCheck();

    this.authService.updateProfile({ fullName: this.fullName }).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: res.message || 'Cập nhật hồ sơ thành công' });

        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.authService.currentUser.set({ ...currentUser, fullName: this.fullName });
          localStorage.setItem('fullName', this.fullName);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Cập nhật hồ sơ thất bại' });
        this.cdr.markForCheck();
      }
    });
  }
}
