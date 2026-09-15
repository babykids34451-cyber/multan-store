export type PaymentMethod = 'cod' | 'raast' | 'jazzcash';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number;
  images: string[];
  stock: number;
  sku: string;
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  tags?: string[];
  featured?: boolean;
  isNew?: boolean;
  isActive: boolean;
  specifications?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  itemCount?: number;
}

export interface Banner {
  id: string;
  tag: string;
  headline: string;
  subheadline: string;
  badge: string;
  offerCode: string;
  bgImage: string;
  primaryBtnText: string;
  primaryLinkType?: 'category' | 'shop' | 'whatsapp' | 'custom';
  primaryLinkValue?: string;
  secondaryBtnText: string;
  secondaryLinkType?: 'category' | 'shop' | 'whatsapp' | 'custom';
  secondaryLinkValue?: string;
  accentColor?: string;
  isActive: boolean;
  order?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedVariant?: ProductVariant;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area?: string;
  postalCode?: string;
  orderNotes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  productName?: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  selectedSize?: string;
  color?: string;
  selectedColor?: string;
  total: number;
}

export interface Order {
  orderId: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  customerAddress?: string;
  city: string;
  customerCity?: string;
  area?: string;
  postalCode?: string;
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  shippingCost?: number;
  discount: number;
  total: number;
  totalAmount?: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrder: number;
  maximumDiscount?: number;
  expiresAt?: string;
  usageLimit?: number;
  isActive: boolean;
}

export interface CustomerProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  area?: string;
  postalCode?: string;
  updatedAt?: string;
}

