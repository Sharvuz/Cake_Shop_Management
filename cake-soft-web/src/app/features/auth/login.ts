import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, MessageModule],
  template: `
    <div class="login-page gradient-bg">
      <div class="login-card glass-effect">


        <div class="login-banner">
          <div class="banner-dots"></div>
          <i class="pi pi-box banner-icon"></i>
          <h2 class="banner-title">CakeSoft</h2>
          <p class="banner-sub">Hệ thống quản lý tiệm bánh ngọt ngào và chuyên nghiệp nhất.</p>
        </div>


        <div class="login-form-wrap">
          <div class="login-heading">
            <h3>Chào mừng trở lại!</h3>
            <p>Vui lòng đăng nhập vào tài khoản của bạn</p>
          </div>

          <div class="form-fields">
            <div class="field">
              <label for="username">Tên đăng nhập</label>
              <input pInputText id="username" [(ngModel)]="username"
                class="login-input" placeholder="Nhập tên tài khoản..." />
            </div>

            <div class="field">
              <label for="password">Mật khẩu</label>
              <input pInputText id="password" type="password" [(ngModel)]="password"
                class="login-input" placeholder="Nhập mật khẩu..."
                (keyup.enter)="onLogin()" />
            </div>

            <button class="btn-login hover-lift" (click)="onLogin()" [disabled]="isLoading">
              <i class="pi" [class.pi-sign-in]="!isLoading" [class.pi-spin]="isLoading" [class.pi-spinner]="isLoading"></i>
              {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>

            <p-message *ngIf="errorMessage" severity="error" styleClass="w-full mt-2 rounded-lg">{{ errorMessage }}</p-message>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }

    .login-card {
      display: flex;
      width: 100%;
      max-width: 900px;
      min-height: 500px;
      border-radius: 1.5rem;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.15);
    }

    /* Banner trái */
    .login-banner {
      flex: 1;
      background: #e11d48;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .banner-dots {
      position: absolute;
      inset: 0;
      opacity: 0.15;
      background-image:
        radial-gradient(circle at 20% 80%, white 2px, transparent 2px),
        radial-gradient(circle at 80% 20%, white 2px, transparent 2px);
      background-size: 50px 50px;
    }
    .banner-icon { font-size: 4rem; margin-bottom: 1rem; position: relative; }
    .banner-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; position: relative; }
    .banner-sub { color: #fecdd3; font-size: 1rem; position: relative; }

    /* Form phải */
    .login-form-wrap {
      flex: 1;
      background: #fff;
      padding: 2.5rem 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-left: 1px solid #fecdd3;
    }
    .login-heading { margin-bottom: 2rem; }
    .login-heading h3 { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; }
    .login-heading p { color: #64748b; font-size: 0.9rem; }

    .form-fields { display: flex; flex-direction: column; gap: 1.25rem; }

    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; color: #374151; font-size: 0.9rem; }
    .login-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.625rem;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .login-input:focus {
      border-color: #e11d48;
      background: #fff;
    }

    .btn-login {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.9rem;
      margin-top: 0.5rem;
      background: linear-gradient(135deg, #e11d48, #f97316);
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      border: none;
      border-radius: 0.875rem;
      cursor: pointer;
      letter-spacing: 0.02em;
      box-shadow: 0 4px 16px rgba(225,29,72,0.35);
      transition: all 0.2s;
    }
    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(225,29,72,0.45);
    }
    .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

    @media (max-width: 640px) {
      .login-banner { display: none; }
      .login-form-wrap { padding: 2rem 1.5rem; border-left: none; }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Đăng nhập thất bại';
      }
    });
  }
}
