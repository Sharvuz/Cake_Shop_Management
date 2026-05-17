import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, EmployeeListItem } from '../../../core/auth/auth.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-user-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  imports: [
    CommonModule, FormsModule, TableModule, DialogModule, ButtonModule,
    InputTextModule, ToastModule, ConfirmDialogModule, MessageModule, TagModule, PasswordModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  employees: EmployeeListItem[] = [];
  createDialog = false;
  editDialog = false;
  submitted = false;
  isSaving = false;
  errorMessage = '';

  newEmp = { fullName: '', username: '', email: '', password: '' };
  editEmp = { id: '', fullName: '', email: '' };

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.authService.getEmployees().subscribe({
      next: (data) => { this.employees = data; this.cdr.markForCheck(); },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tải được danh sách nhân viên' });
      }
    });
  }

  openCreateDialog() {
    this.newEmp = { fullName: '', username: '', email: '', password: '' };
    this.submitted = false;
    this.errorMessage = '';
    this.createDialog = true;
  }

  createEmployee() {
    this.submitted = true;
    if (!this.newEmp.fullName || !this.newEmp.username || !this.newEmp.password) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.authService.registerEmployee(this.newEmp).subscribe({
      next: () => {
        this.isSaving = false;
        this.createDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Tạo tài khoản nhân viên thành công' });
        this.loadEmployees();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Tạo tài khoản thất bại. Username có thể đã tồn tại.';
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: this.errorMessage });
        this.cdr.markForCheck();
      }
    });
  }

  openEditDialog(emp: EmployeeListItem) {
    this.editEmp = { id: emp.id, fullName: emp.fullName, email: emp.email };
    this.errorMessage = '';
    this.editDialog = true;
  }

  updateEmployee() {
    this.isSaving = true;
    this.errorMessage = '';
    this.authService.updateEmployee(this.editEmp.id, { fullName: this.editEmp.fullName, email: this.editEmp.email }).subscribe({
      next: () => {
        this.isSaving = false;
        this.editDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật thông tin nhân viên thành công' });
        this.loadEmployees();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Cập nhật thất bại';
        this.cdr.markForCheck();
      }
    });
  }

  deactivate(emp: EmployeeListItem) {
    this.confirmationService.confirm({
      message: `Bạn có chắc muốn khóa tài khoản "${emp.fullName}"? Nhân viên sẽ không thể đăng nhập.`,
      header: 'Xác nhận khóa tài khoản',
      icon: 'pi pi-lock',
      acceptLabel: 'Khóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.authService.deactivateEmployee(emp.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã khóa tài khoản "${emp.fullName}"` });
            this.loadEmployees();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Khóa tài khoản thất bại' })
        });
      }
    });
  }

  reactivate(emp: EmployeeListItem) {
    this.confirmationService.confirm({
      message: `Mở khóa tài khoản "${emp.fullName}"?`,
      header: 'Xác nhận mở khóa',
      icon: 'pi pi-lock-open',
      acceptLabel: 'Mở khóa',
      rejectLabel: 'Hủy',
      accept: () => {
        this.authService.reactivateEmployee(emp.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã mở khóa tài khoản "${emp.fullName}"` });
            this.loadEmployees();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Mở khóa thất bại' })
        });
      }
    });
  }
}
