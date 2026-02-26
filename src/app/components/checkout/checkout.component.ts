import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private cartSub!: Subscription;

  // Multi-step: 1 = Cart Review, 2 = Shipping, 3 = Payment, 4 = Confirmation
  currentStep = 1;

  // Shipping form
  shipping = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    parish: '',
    zip: ''
  };

  // Payment form
  payment = {
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  };

  // Payment processing state
  isProcessing = false;
  orderNumber = '';

  parishes = [
    'Kingston', 'St. Andrew', 'St. Thomas', 'Portland',
    'St. Mary', 'St. Ann', 'Trelawny', 'St. James',
    'Hanover', 'Westmoreland', 'St. Elizabeth', 'Manchester',
    'Clarendon', 'St. Catherine'
  ];

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.cartSub = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });

    // Autofill shipping info if user is logged in
    this.authService.currentUser.subscribe(user => {
      if (user) {
        const userData = user.user || user;
        if (!this.shipping.fullName) this.shipping.fullName = userData.name || '';
        if (!this.shipping.email) this.shipping.email = userData.email || '';
      }
    });
  }

  ngOnDestroy() {
    this.cartSub.unsubscribe();
  }

  get subtotal(): number {
    return this.cartService.getTotal();
  }

  get shipping_cost(): number {
    return this.subtotal > 10000 ? 0 : 500;
  }

  get tax(): number {
    return Math.round(this.subtotal * 0.15);
  }

  get total(): number {
    return this.subtotal + this.shipping_cost + this.tax;
  }

  updateQuantity(name: string, qty: number) {
    this.cartService.updateQuantity(name, qty);
  }

  removeItem(name: string) {
    this.cartService.removeFromCart(name);
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isShippingValid(): boolean {
    return !!(
      this.shipping.fullName &&
      this.shipping.email &&
      this.shipping.phone &&
      this.shipping.address &&
      this.shipping.city &&
      this.shipping.parish
    );
  }

  isPaymentValid(): boolean {
    return !!(
      this.payment.cardNumber.length >= 16 &&
      this.payment.cardName &&
      this.payment.expiry.length >= 5 &&
      this.payment.cvv.length >= 3
    );
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = formatted;
    this.payment.cardNumber = value;
  }

  formatExpiry(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    input.value = value;
    this.payment.expiry = value;
  }

  processPayment() {
    if (!this.isPaymentValid()) return;

    this.isProcessing = true;

    // Get current user ID from AuthService or local storage
    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    if (!currentUser || !currentUser.user || !currentUser.user.id) {
      console.error('User not logged in or ID not found');
      this.isProcessing = false;
      // Handle error, maybe redirect to login or show message
      return;
    }

    const orderData = {
      userId: currentUser.user.id,
      totalAmount: this.total,
      items: this.cartItems.map(item => ({
        id: item.name, // The backend expects a product ID, but the cart currenly uses name. We need to fetch real IDs if possible, but for now we pass the name as ID which will fail the foreign key constraint. We need to fix the cart to store product IDs.
        quantity: item.quantity,
        price: item.price
      }))
    };

    // We will simulate the payment delay then save
    setTimeout(() => {
      this.orderService.placeOrder(orderData).subscribe({
        next: (res) => {
          console.log('Order placed successfully', res);
          this.isProcessing = false;
          this.orderNumber = 'HRT-' + Math.random().toString(36).substring(2, 8).toUpperCase(); // using mock order number for now or we could use the ID
          this.currentStep = 4;
          this.cartService.clearCart();
        },
        error: (err) => {
          console.error('Error placing order:', err);
          this.isProcessing = false;
        }
      });
    }, 2500);
  }

  formatPrice(price: number): string {
    return price.toLocaleString();
  }
}
