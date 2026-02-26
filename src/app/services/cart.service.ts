import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
    name: string;
    price: number;
    image: string;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems: CartItem[] = [];
    private cartSubject = new BehaviorSubject<CartItem[]>([]);

    cart$ = this.cartSubject.asObservable();

    addToCart(product: { name: string; price: string; image: string }) {
        const numericPrice = parseFloat(product.price.replace(/,/g, ''));
        const existing = this.cartItems.find(item => item.name === product.name);

        if (existing) {
            existing.quantity++;
        } else {
            this.cartItems.push({
                name: product.name,
                price: numericPrice,
                image: product.image,
                quantity: 1
            });
        }

        this.cartSubject.next([...this.cartItems]);
    }

    removeFromCart(name: string) {
        this.cartItems = this.cartItems.filter(item => item.name !== name);
        this.cartSubject.next([...this.cartItems]);
    }

    updateQuantity(name: string, quantity: number) {
        const item = this.cartItems.find(i => i.name === name);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(name);
            } else {
                item.quantity = quantity;
                this.cartSubject.next([...this.cartItems]);
            }
        }
    }

    getTotal(): number {
        return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    getItemCount(): number {
        return this.cartItems.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.cartItems = [];
        this.cartSubject.next([]);
    }
}
