import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    placeOrder(orderData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, orderData);
    }

    getUserOrders(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
    }
}
