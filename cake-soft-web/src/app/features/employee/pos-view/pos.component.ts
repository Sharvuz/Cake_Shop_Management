import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CakeService, Cake, CakeCategory } from '../../../core/services/cake.service';
import { InvoiceService, CreateInvoiceRequest } from '../../../core/services/invoice.service';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { environment } from '../../../../environments/environment';

interface CartItem {
  cake: Cake;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ToastModule, ConfirmDialogModule, TagModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
  cakes: Cake[] = [];
  filteredCakes: Cake[] = [];
  categories: CakeCategory[] = [];
  selectedCategoryId: number | null = null;

  cart: CartItem[] = [];
  isSubmitting = false;

  constructor(
    private cakeService: CakeService, 
    private invoiceService: InvoiceService, 
    private cdr: ChangeDetectorRef, 
    private messageService: MessageService, 
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.cakeService.getCategories().subscribe({
      next: (data: CakeCategory[]) => {
        this.categories = data;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh mục.' });
        console.error(err);
      }
    });

    this.cakeService.getAllCakes().subscribe({
      next: (data: Cake[]) => {
        this.cakes = data;
        this.filterCakes();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách bánh.' });
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  filterCakes() {
    if (this.selectedCategoryId) {
      this.filteredCakes = this.cakes.filter(c => c.categoryId === this.selectedCategoryId);
    } else {
      this.filteredCakes = [...this.cakes];
    }
  }

  getImageUrl(url?: string): string {
    if (!url) return 'assets/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }

  addToCart(cake: Cake) {
    if (cake.quantity === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Hết hàng', detail: 'Sản phẩm này đã hết hàng!' });
      return;
    }

    const existingItem = this.cart.find(i => i.cake.id === cake.id);
    if (existingItem) {
      if (existingItem.quantity < cake.quantity) {
        existingItem.quantity++;
        this.cdr.markForCheck();
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Giới hạn kho', detail: 'Đã đạt số lượng tồn kho tối đa!' });
      }
    } else {
      this.cart.push({ cake: cake, quantity: 1 });
      this.cdr.markForCheck();
    }
  }

  increaseQuantity(item: CartItem) {
    if (item.quantity < item.cake.quantity) {
      item.quantity++;
      this.cdr.markForCheck();
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Giới hạn kho', detail: 'Đã đạt số lượng tồn kho tối đa!' });
    }
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.cart = this.cart.filter(i => i.cake.id !== item.cake.id);
    }
    this.cdr.markForCheck();
  }

  get totalAmount(): number {
    return this.cart.reduce((total, item) => total + (item.cake.price * item.quantity), 0);
  }

  checkout() {
    if (this.cart.length === 0) return;

    this.confirmationService.confirm({
      message: 'Xác nhận thanh toán và tạo đơn hàng?',
      header: 'Xác nhận thanh toán',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Thanh toán',
      rejectLabel: 'Hủy',
      accept: () => {
        this.isSubmitting = true;
        this.cdr.markForCheck();

        const request: CreateInvoiceRequest = {
          items: this.cart.map(i => ({ cakeId: i.cake.id!, quantity: i.quantity }))
        };

        this.invoiceService.createInvoice(request).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Tạo đơn hàng thành công!' });
            this.cart = [];
            this.isSubmitting = false;
            this.loadData();
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Tạo đơn thất bại' });
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }
}
