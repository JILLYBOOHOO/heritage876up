import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  addedProduct: string | null = null;
  private readonly fallbackProducts = [
    {
      id: 'local-1',
      name: 'Soursop Leaf',
      description: 'Traditional Jamaican soursop leaf tea for daily wellness.',
      price: 1200,
      image: '/soursopleaf.jpeg'
    },
    {
      id: 'local-2',
      name: 'Fever Grass',
      description: 'Fresh fever grass bundle, ideal for calming herbal tea.',
      price: 900,
      image: '/fevergrass.jpeg'
    },
    {
      id: 'local-3',
      name: 'Life Leaf',
      description: 'Popular life leaf herb, prepared and packaged for easy use.',
      price: 1100,
      image: '/lifeleaf.jpeg'
    },
    {
      id: 'local-4',
      name: 'Guinea Henweed',
      description: 'Freshly dried Guinea Henweed, a powerful traditional herb.',
      price: 1000,
      image: '/leaf.jpeg'
    },
    {
      id: 'local-5',
      name: 'Domino Board',
      description: 'Authentic Jamaican domino board made from premium wood.',
      price: 3800,
      image: '/dominoboardja.jpg'
    },
    {
      id: 'local-6',
      name: 'Jamaican Domino',
      description: 'Classic double-six domino set with traditional markings.',
      price: 2500,
      image: '/jadomino.jpg'
    },
    {
      id: 'local-7',
      name: 'Jamaican Dice',
      description: 'High-quality dice set for games night and travel.',
      price: 1200,
      image: '/jadice.jpg'
    },
    {
      id: 'local-8',
      name: 'Domino Table Board',
      description: 'Large-format board for events and domino tournaments.',
      price: 6500,
      image: '/jaludiboard.jpg'
    },
    {
      id: 'local-9',
      name: 'Caribbean Wellness Blend',
      description: 'Balanced herbal blend inspired by Jamaican roots.',
      price: 1500,
      image: '/istockphoto-1131296855-612x612.jpg'
    },
    {
      id: 'local-10',
      name: 'Island Spice Mix',
      description: 'Aromatic spice blend for meats, seafood, and vegetables.',
      price: 1400,
      image: '/istockphoto-1184178472-612x612.jpg'
    },
    {
      id: 'local-11',
      name: 'Natural Immune Tea',
      description: 'Herbal tea blend traditionally used for daily support.',
      price: 1350,
      image: '/istockphoto-1219202738-612x612.jpg'
    },
    {
      id: 'local-12',
      name: 'Roots Tonic Mix',
      description: 'Traditional roots-inspired dry mix with island flavors.',
      price: 1800,
      image: '/istockphoto-1319604939-612x612.jpg'
    },
    {
      id: 'local-13',
      name: 'Premium Herb Bundle',
      description: 'Hand-selected premium herbs from trusted local growers.',
      price: 2200,
      image: '/istockphoto-1401783654-612x612.jpg'
    },
    {
      id: 'local-14',
      name: 'Devon House Keepsake',
      description: 'A beautiful gift item inspired by Devon House in Kingston.',
      price: 4200,
      image: '/istockphoto-498732159-612x612.jpg'
    }
  ];

  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map(p => ({
          ...p,
          image: p.image_url // Mapping image_url to image for compatibility with existing template
        }));
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.products = [...this.fallbackProducts];
      }
    });
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
    this.addedProduct = product.name;
    setTimeout(() => {
      this.addedProduct = null;
    }, 1500);
  }
}
