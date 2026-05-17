import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface EmployeeListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  
  public currentUser = signal<{ fullName: string, role: string } | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    const role = localStorage.getItem('role');

    if (token && fullName && role) {
      this.currentUser.set({ fullName, role });
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('fullName', res.fullName);
        localStorage.setItem('role', res.role);
        this.currentUser.set({ fullName: res.fullName, role: res.role });
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }



  getEmployees(): Observable<EmployeeListItem[]> {
    return this.http.get<EmployeeListItem[]>(`${this.apiUrl}/employees`);
  }

  registerEmployee(data: { username: string; password: string; email: string; fullName: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  updateEmployee(id: string, data: { fullName: string; email: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/employees/${id}`, data);
  }

  deactivateEmployee(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/employees/${id}/deactivate`, {});
  }

  reactivateEmployee(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/employees/${id}/reactivate`, {});
  }
}

