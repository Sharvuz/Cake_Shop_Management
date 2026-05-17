import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardService, AdminDashboardResponse, EmployeeDashboardResponse } from '../../../core/services/dashboard.service';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ChartModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isAdmin = false;
  userName = '';
  isLoading = true;

  adminData: AdminDashboardResponse | null = null;
  employeeData: EmployeeDashboardResponse | null = null;

  lineChartData: any = {};
  lineChartOptions: any = {};
  doughnutData: any = {};
  doughnutOptions: any = {};
  barChartData: any = {};
  barChartOptions: any = {};

  empBarData: any = {};
  empBarOptions: any = {};

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'Admin';
    this.userName = this.authService.currentUser()?.fullName || 'Người dùng';

    if (this.isAdmin) {
      this.dashboardService.getAdminDashboard().subscribe({
        next: (data) => {
          this.adminData = data;
          this.buildAdminCharts(data);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.isLoading = false; this.cdr.detectChanges(); }
      });
    } else {
      this.dashboardService.getEmployeeDashboard().subscribe({
        next: (data) => {
          this.employeeData = data;
          this.buildEmployeeCharts(data);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.isLoading = false; this.cdr.detectChanges(); }
      });
    }
  }

  private buildAdminCharts(data: AdminDashboardResponse) {
    const labels = data.monthlyRevenue.map(d => d.label);

    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'Doanh thu (VND)',
          data: data.monthlyRevenue.map(d => d.value),
          borderColor: '#e11d48',
          backgroundColor: 'rgba(225,29,72,0.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#e11d48',
          pointRadius: 5,
          yAxisID: 'y'
        },
        {
          label: 'Số đơn hàng',
          data: data.monthlyOrders.map(d => d.value),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 5,
          yAxisID: 'y1'
        }
      ]
    };
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { font: { family: 'Inter', size: 12 }, color: '#475569' } } },
      scales: {
        x: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
        y: {
          type: 'linear', position: 'left',
          grid: { color: '#f1f5f9' },
          ticks: { color: '#94a3b8', callback: (v: number) => this.shortCurrency(v) }
        },
        y1: {
          type: 'linear', position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#94a3b8' }
        }
      }
    };

    const statusColors: Record<string, string> = {
      Pending: '#f59e0b', Processing: '#3b82f6',
      Completed: '#10b981', Cancelled: '#ef4444'
    };
    const statusLabelsVi: Record<string, string> = {
      Pending: 'Chờ xử lý', Processing: 'Đang xử lý',
      Completed: 'Hoàn thành', Cancelled: 'Đã hủy'
    };
    this.doughnutData = {
      labels: data.orderStatusDistribution.map(s => statusLabelsVi[s.status] ?? s.status),
      datasets: [{
        data: data.orderStatusDistribution.map(s => s.count),
        backgroundColor: data.orderStatusDistribution.map(s => statusColors[s.status] ?? '#94a3b8'),
        hoverOffset: 8,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 }, color: '#475569', padding: 16 } }
      }
    };

    this.barChartData = {
      labels: data.topCakes.map(c => c.name),
      datasets: [
        {
          label: 'Số lượng bán',
          data: data.topCakes.map(c => c.totalSold),
          backgroundColor: [
            'rgba(225,29,72,0.8)', 'rgba(249,115,22,0.8)',
            'rgba(234,179,8,0.8)', 'rgba(16,185,129,0.8)', 'rgba(59,130,246,0.8)'
          ],
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };
    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 12, weight: 600 } } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', stepSize: 1 } }
      }
    };
  }

  private buildEmployeeCharts(data: EmployeeDashboardResponse) {
    this.empBarData = {
      labels: data.weeklyOrders.map(d => d.label),
      datasets: [{
        label: 'Số đơn',
        data: data.weeklyOrders.map(d => d.value),
        backgroundColor: 'rgba(13,148,136,0.75)',
        hoverBackgroundColor: '#0d9488',
        borderRadius: 8,
        borderSkipped: false
      }]
    };
    this.empBarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#475569' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', stepSize: 1 } }
      }
    };
  }

  getCompletedPct(): number {
    if (!this.employeeData || this.employeeData.totalOrders === 0) return 0;
    return (this.employeeData.completedOrders / this.employeeData.totalOrders) * 100;
  }

  getCancelledPct(): number {
    if (!this.employeeData || this.employeeData.totalOrders === 0) return 0;
    return (this.employeeData.cancelledOrders / this.employeeData.totalOrders) * 100;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  private shortCurrency(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
    return value.toString();
  }
}
