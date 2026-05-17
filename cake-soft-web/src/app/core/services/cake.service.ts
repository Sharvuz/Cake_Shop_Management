import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface CakeCategory {
  id: number;
  name: string;
  description: string;
}

export interface Cake {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CakeService {
  private apiUrl = `${environment.apiUrl}/cake`;

  constructor(private http: HttpClient) { }

  getCategories() {
    return this.http.get<CakeCategory[]>(`${this.apiUrl}/categories`);
  }

  getAllCakes() {
    return this.http.get<Cake[]>(this.apiUrl);
  }

  getCake(id: number) {
    return this.http.get<Cake>(`${this.apiUrl}/${id}`);
  }

  createCake(data: FormData) {
    return this.http.post<Cake>(this.apiUrl, data);
  }

  updateCake(id: number, data: FormData) {
    return this.http.put<Cake>(`${this.apiUrl}/${id}`, data);
  }

  deleteCake(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  restoreCake(id: number) {
    return this.http.patch(`${this.apiUrl}/${id}/restore`, {});
  }
}
