import { Component, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CakeService, Cake, CakeCategory } from '../../../core/services/cake.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cake-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  imports: [
    CommonModule, FormsModule, TableModule, DialogModule, ButtonModule,
    InputTextModule, InputNumberModule, SelectModule, TextareaModule, MessageModule,
    FileUploadModule, ToastModule, ConfirmDialogModule, TagModule
  ],
  templateUrl: './cake-management.component.html',
  styleUrls: ['./cake-management.component.css']
})
export class CakeManagementComponent implements OnInit {
  cakes: Cake[] = [];
  categories: CakeCategory[] = [];

  // ── Filter state ────────────────────────────────────────────────
  searchText: string = '';
  filterCategoryId: number | null = null;
  filterStatus: string | null = null;   // 'active' | 'inactive' | null
  filterPriceMin: number | null = null;
  filterPriceMax: number | null = null;
  filterQtyMin: number | null = null;
  filterQtyMax: number | null = null;

  filterPanelOpen: boolean = false;

  get activeFilterCount(): number {
    let n = 0;
    if (this.filterCategoryId) n++;
    if (this.filterStatus !== null) n++;
    if (this.filterPriceMin !== null || this.filterPriceMax !== null) n++;
    if (this.filterQtyMin !== null || this.filterQtyMax !== null) n++;
    return n;
  }

  get filteredCakes(): Cake[] {
    const txt = this.searchText.trim().toLowerCase();
    return this.cakes.filter(c => {
      // Text search
      if (txt && !c.name.toLowerCase().includes(txt) &&
          !(c.categoryName ?? '').toLowerCase().includes(txt)) return false;
      // Category
      if (this.filterCategoryId && c.categoryId !== this.filterCategoryId) return false;
      // Status
      if (this.filterStatus === 'active' && !c.isActive) return false;
      if (this.filterStatus === 'inactive' && c.isActive) return false;
      // Price range
      if (this.filterPriceMin !== null && c.price < this.filterPriceMin) return false;
      if (this.filterPriceMax !== null && c.price > this.filterPriceMax) return false;
      // Quantity range
      if (this.filterQtyMin !== null && c.quantity < this.filterQtyMin) return false;
      if (this.filterQtyMax !== null && c.quantity > this.filterQtyMax) return false;
      return true;
    });
  }

  // Status options for dropdown
  statusOptions = [
    { label: 'Hoạt động', value: 'active' },
    { label: 'Đã xóa',   value: 'inactive' },
  ];

  // ── Dialog state ─────────────────────────────────────────────────
  cakeDialog: boolean = false;
  cake: Partial<Cake> = {};
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  submitted: boolean = false;
  isSaving: boolean = false;
  editMode: boolean = false;
  errorMessage: string = '';

  @ViewChild('fileInput') fileInput: any;

  constructor(
    private cakeService: CakeService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.cakeService.getCategories().subscribe(res => {
      this.categories = res;
      this.cdr.markForCheck();
    });
    this.cakeService.getAllCakes().subscribe(res => {
      this.cakes = res;
      this.cdr.markForCheck();
    });
  }

  // ── Filter helpers ───────────────────────────────────────────────
  toggleFilterPanel() {
    this.filterPanelOpen = !this.filterPanelOpen;
  }

  clearFilters() {
    this.filterCategoryId = null;
    this.filterStatus = null;
    this.filterPriceMin = null;
    this.filterPriceMax = null;
    this.filterQtyMin = null;
    this.filterQtyMax = null;
    this.searchText = '';
    this.cdr.markForCheck();
  }

  onFilterChange() {
    this.cdr.markForCheck();
  }

  // ── Image helpers ────────────────────────────────────────────────
  getImageUrl(url?: string) {
    if (!url) return 'assets/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${environment.baseUrl}${url}`;
  }

  // ── CRUD helpers ─────────────────────────────────────────────────
  openNew() {
    this.cake = { price: 0, quantity: 0 };
    this.submitted = false;
    this.editMode = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.errorMessage = '';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    this.cakeDialog = true;
  }

  editCake(cake: Cake) {
    this.cake = { ...cake };
    this.editMode = true;
    this.submitted = false;
    this.selectedFile = null;
    this.imagePreview = this.getImageUrl(cake.imageUrl);
    this.errorMessage = '';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    this.cakeDialog = true;
  }

  deleteCake(cake: Cake) {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa bánh "${cake.name}"? Bánh sẽ bị ẩn khỏi cửa hàng nhưng vẫn được lưu trong lịch sử hóa đơn.`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cakeService.deleteCake(cake.id!).subscribe({
          next: () => {
            const idx = this.cakes.findIndex(c => c.id === cake.id);
            if (idx !== -1) {
              this.cakes[idx] = { ...this.cakes[idx], isActive: false };
              this.cakes = [...this.cakes];
            }
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã xóa bánh "${cake.name}"` });
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Xóa thất bại' });
          }
        });
      }
    });
  }

  restoreCake(cake: Cake) {
    this.confirmationService.confirm({
      message: `Bạn có muốn khôi phục bánh "${cake.name}" không?`,
      header: 'Xác nhận khôi phục',
      icon: 'pi pi-refresh',
      acceptLabel: 'Khôi phục',
      rejectLabel: 'Hủy',
      accept: () => {
        this.cakeService.restoreCake(cake.id!).subscribe({
          next: () => {
            const idx = this.cakes.findIndex(c => c.id === cake.id);
            if (idx !== -1) {
              this.cakes[idx] = { ...this.cakes[idx], isActive: true };
              this.cakes = [...this.cakes];
            }
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã khôi phục bánh "${cake.name}"` });
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Khôi phục thất bại' });
          }
        });
      }
    });
  }

  hideDialog() {
    this.cakeDialog = false;
    this.submitted = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  saveCake() {
    this.submitted = true;

    if (!this.cake.name || !this.cake.categoryId) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('name', this.cake.name || '');
    formData.append('categoryId', this.cake.categoryId?.toString() || '');
    formData.append('price', this.cake.price?.toString() || '0');
    formData.append('quantity', this.cake.quantity?.toString() || '0');
    formData.append('description', this.cake.description || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.editMode && this.cake.id) {
      this.cakeService.updateCake(this.cake.id, formData).subscribe({
        next: (res) => {
          const index = this.cakes.findIndex(c => c.id === this.cake.id);
          if (index !== -1) {
            this.cakes[index] = res;
          }
          this.cakes = [...this.cakes];
          this.isSaving = false;
          this.cakeDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật bánh thành công' });
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = err.error?.message || 'Cập nhật thất bại';
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: this.errorMessage });
          this.cdr.markForCheck();
        }
      });
    } else {
      this.cakeService.createCake(formData).subscribe({
        next: (res) => {
          this.cakes = [res, ...this.cakes];
          this.isSaving = false;
          this.cakeDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm bánh mới thành công' });
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = err.error?.message || 'Thêm thất bại';
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: this.errorMessage });
          this.cdr.markForCheck();
        }
      });
    }
  }
}
