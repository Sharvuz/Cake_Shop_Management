import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum InvoiceStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface InvoiceDetail {
  id: number;
  cakeId: number;
  cakeName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  cakeIsActive: boolean;
}

export interface Invoice {
  id: number;
  userId: string;
  userName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  details: InvoiceDetail[];
}

export interface CreateInvoiceItem {
  cakeId: number;
  quantity: number;
}

export interface CreateInvoiceRequest {
  items: CreateInvoiceItem[];
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/Invoice`;

  constructor(private http: HttpClient) {}

  createInvoice(request: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, request);
  }

  getInvoices(status?: string): Observable<Invoice[]> {
    let url = this.apiUrl;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<Invoice[]>(url);
  }

  updateStatus(id: number, newStatus: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}/status`, JSON.stringify(newStatus), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
