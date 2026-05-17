import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TopCakeItem {
  name: string;
  totalSold: number;
  revenue: number;
}

export interface OrderStatusItem {
  status: string;
  count: number;
}

export interface AdminDashboardResponse {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  outOfStockCakes: number;
  totalEmployees: number;
  monthlyRevenue: ChartDataPoint[];
  monthlyOrders: ChartDataPoint[];
  topCakes: TopCakeItem[];
  orderStatusDistribution: OrderStatusItem[];
}

export interface EmployeeDashboardResponse {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalOrders: number;
  highestOrderAmount: number;
  averageOrderAmount: number;
  completedOrders: number;
  cancelledOrders: number;
  weeklyOrders: ChartDataPoint[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  getAdminDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.apiUrl}/admin`);
  }

  getEmployeeDashboard(): Observable<EmployeeDashboardResponse> {
    return this.http.get<EmployeeDashboardResponse>(`${this.apiUrl}/employee`);
  }
}
