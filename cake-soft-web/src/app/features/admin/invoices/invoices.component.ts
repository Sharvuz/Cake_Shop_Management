import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService, Invoice, InvoiceStatus } from '../../../core/services/invoice.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-invoices',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  imports: [CommonModule, FormsModule, TableModule, DialogModule, ButtonModule, SelectModule, TagModule, ToastModule, ConfirmDialogModule],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  filterStatus: string | null = null;
  isAdmin = false;

  statusOptions = [
    { label: 'Chờ xử lý', value: InvoiceStatus.Pending },
    { label: 'Đang xử lý', value: InvoiceStatus.Processing },
    { label: 'Hoàn thành', value: InvoiceStatus.Completed },
    { label: 'Đã hủy', value: InvoiceStatus.Cancelled }
  ];

  selectedInvoice: Invoice | null = null;
  displayDialog = false;
  newStatus: string | null = null;
  isUpdating = false;

  constructor(
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'Admin';
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getInvoices(this.filterStatus || undefined).subscribe({
      next: (data) => {
        this.invoices = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách hóa đơn.' });
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  viewDetails(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.newStatus = invoice.status;
    this.displayDialog = true;
  }

  updateStatus() {
    if (!this.selectedInvoice || !this.newStatus) return;

    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn đổi trạng thái đơn hàng này?',
      header: 'Xác nhận cập nhật',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Cập nhật',
      rejectLabel: 'Hủy',
      accept: () => {
        this.isUpdating = true;
        this.cdr.markForCheck();

        this.invoiceService.updateStatus(this.selectedInvoice!.id, this.newStatus!).subscribe({
          next: (updatedInvoice) => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật trạng thái thành công!' });
            this.isUpdating = false;
            this.displayDialog = false;
            const idx = this.invoices.findIndex(i => i.id === updatedInvoice.id);
            if (idx !== -1) {
              this.invoices[idx] = updatedInvoice;
              this.invoices = [...this.invoices];
            }
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || err.message });
            this.isUpdating = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch(status) {
      case 'Pending': return 'warn';
      case 'Processing': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'Chờ xử lý',
      'Processing': 'Đang xử lý',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy'
    };
    return map[status] ?? status;
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'pi pi-clock',
      'Processing': 'pi pi-sync',
      'Completed': 'pi pi-check-circle',
      'Cancelled': 'pi pi-times-circle'
    };
    return map[status] ?? 'pi pi-circle';
  }

  getImageUrl(url?: string): string {
    if (!url) return 'assets/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }
}
