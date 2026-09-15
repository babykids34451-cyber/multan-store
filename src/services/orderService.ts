import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order, Coupon } from '../types';
import { initialCoupons } from './productData';

const ORDERS_BACKUP_KEY = 'shaan_store_orders_backup_v2';
const ORDERS_CLEARED_KEY = 'shaan_store_orders_cleared_v1';

export function isOrdersCleared(): boolean {
  try {
    return localStorage.getItem(ORDERS_CLEARED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOrdersCleared(cleared: boolean) {
  try {
    if (cleared) {
      localStorage.setItem(ORDERS_CLEARED_KEY, 'true');
    } else {
      localStorage.removeItem(ORDERS_CLEARED_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

// Seed demo Pakistani orders for admin dashboard initial state
export const demoInitialOrders: Order[] = [
  {
    orderId: 'SHN-202609-8412',
    customerId: 'cust-101',
    customerName: 'Muhammad Usman',
    customerPhone: '03001234567',
    customerEmail: 'usman.lahore@example.com',
    deliveryAddress: 'House 42-B, Sector Y, Phase 3, DHA',
    city: 'Lahore',
    area: 'DHA Phase 3',
    postalCode: '54000',
    orderNotes: 'Please deliver after 4 PM if possible.',
    items: [
      {
        productId: 'prod-001',
        name: 'Charsadda Peshawari Chappal (Double Sole)',
        sku: 'CHP-CR-BLK',
        price: 4490,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
        size: '42',
        total: 4490,
      },
    ],
    subtotal: 4490,
    shipping: 0,
    discount: 0,
    total: 4490,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'shipped',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderId: 'SHN-202609-7239',
    customerId: 'cust-102',
    customerName: 'Fatima Zahra',
    customerPhone: '03217654321',
    customerEmail: 'fatima.zahra@example.com',
    deliveryAddress: 'Apartment 304, Silver Oaks, F-10/4',
    city: 'Islamabad',
    area: 'Sector F-10',
    postalCode: '44000',
    orderNotes: 'Verified via Raast transfer.',
    items: [
      {
        productId: 'prod-003',
        name: 'Embroidered Summer Lawn 3-Piece',
        sku: 'LWN-EMB-ROSE',
        price: 6850,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
        size: 'M',
        total: 6850,
      },
    ],
    subtotal: 6850,
    shipping: 0,
    discount: 685,
    total: 6165,
    couponCode: 'SHAAN10',
    paymentMethod: 'raast',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    transactionId: 'RST-987412356',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderId: 'SHN-202609-3105',
    customerId: 'cust-103',
    customerName: 'Tariq Aziz',
    customerPhone: '03339876543',
    customerEmail: 'tariq.aziz@example.com',
    deliveryAddress: 'Street 7, Block 13-D, Gulshan-e-Iqbal',
    city: 'Karachi',
    area: 'Gulshan-e-Iqbal',
    postalCode: '75300',
    orderNotes: 'Call before arriving at the gate.',
    items: [
      {
        productId: 'prod-005',
        name: 'Genuine Leather Bifold Wallet',
        sku: 'LTH-WLT-BRN',
        price: 2490,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
        total: 2490,
      },
    ],
    subtotal: 2490,
    shipping: 200,
    discount: 0,
    total: 2690,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export function getLocalOrdersBackup(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_BACKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrdersBackup(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_BACKUP_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders backup:', e);
  }
}

// Generates a professional order ID format e.g. "SHN-202609-4821"
export function generateOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SHN-${dateStr}-${randomSuffix}`;
}

export async function createOrderInBackend(orderData: Omit<Order, 'createdAt' | 'updatedAt'>): Promise<Order> {
  const path = 'orders';
  const now = new Date().toISOString();
  const order: Order = {
    ...orderData,
    createdAt: now,
    updatedAt: now,
  };

  // Always save locally to ensure order visibility in admin even offline
  try {
    const existing = getLocalOrdersBackup();
    saveLocalOrdersBackup([order, ...existing.filter((o) => o.orderId !== order.orderId)]);
  } catch (err) {
    console.warn('Local order backup warning:', err);
  }

  try {
    const orderDocRef = doc(db, path, order.orderId);
    await setDoc(orderDocRef, order);
    return order;
  } catch (error) {
    console.warn('Remote firestore order save error, order kept in local storage:', error);
    return order;
  }
}

// Admin: Get all orders from Firestore merged with local backup and demo items
export async function getAllOrdersAdmin(): Promise<Order[]> {
  const localOrders = getLocalOrdersBackup();
  const cleared = isOrdersCleared();
  const orderMap = new Map<string, Order>();

  // Only add demo orders if not cleared
  if (!cleared) {
    demoInitialOrders.forEach((o) => orderMap.set(o.orderId, o));
  }
  // Add local backup orders
  localOrders.forEach((o) => orderMap.set(o.orderId, o));

  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Order;
      if (data && data.orderId) {
        orderMap.set(data.orderId, data);
      }
    });
  } catch (error) {
    console.warn('Firestore orders read error, using local/demo order records:', error);
  }

  return Array.from(orderMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Admin: Update order status or payment status
export async function updateOrderAdmin(orderId: string, updates: Partial<Order>): Promise<Order> {
  const now = new Date().toISOString();
  const localOrders = getLocalOrdersBackup();
  const existingOrder = localOrders.find((o) => o.orderId === orderId) || demoInitialOrders.find((o) => o.orderId === orderId);

  const updatedOrder: Order = {
    ...(existingOrder || ({} as Order)),
    ...updates,
    orderId,
    updatedAt: now,
  };

  // Update in local orders
  const updatedLocal = localOrders.map((o) => (o.orderId === orderId ? updatedOrder : o));
  if (!updatedLocal.some((o) => o.orderId === orderId)) {
    updatedLocal.unshift(updatedOrder);
  }
  saveLocalOrdersBackup(updatedLocal);

  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { ...updates, updatedAt: now });
  } catch (error) {
    console.warn('Firestore order update failed (remote), local copy saved:', error);
  }

  return updatedOrder;
}

// Admin: Delete order
export async function deleteOrderAdmin(orderId: string): Promise<boolean> {
  const localOrders = getLocalOrdersBackup();
  const filtered = localOrders.filter((o) => o.orderId !== orderId);
  saveLocalOrdersBackup(filtered);

  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    console.warn('Firestore order delete failed:', error);
  }

  return true;
}

// Admin: Wipe/Reset all orders completely
export async function clearAllOrdersAdmin(): Promise<boolean> {
  setOrdersCleared(true);
  saveLocalOrdersBackup([]);

  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'orders', docSnap.id))
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.warn('Firestore orders bulk delete warning:', error);
  }

  return true;
}

// Admin: Restore demo initial orders
export function restoreDefaultDemoOrders(): void {
  setOrdersCleared(false);
  saveLocalOrdersBackup([...demoInitialOrders]);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const cleanId = orderId.trim();
  const path = `orders/${cleanId}`;
  try {
    const docRef = doc(db, 'orders', cleanId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return docSnap.data() as Order;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function trackOrder(orderId: string, phoneOrEmail: string): Promise<{ success: boolean; order?: Order; error?: string }> {
  const cleanId = orderId.trim().toUpperCase();
  const cleanIdentifier = phoneOrEmail.trim().toLowerCase().replace(/[\s-]/g, '');

  if (!cleanId) {
    return { success: false, error: 'Please enter a valid Order ID' };
  }
  if (!cleanIdentifier) {
    return { success: false, error: 'Please enter the phone number or email used during checkout' };
  }

  try {
    const order = await getOrderById(cleanId);
    if (!order) {
      return { success: false, error: 'No order found with the provided Order ID. Please check your tracking number.' };
    }

    const orderPhoneClean = (order.customerPhone || '').replace(/[\s-]/g, '').toLowerCase();
    const orderEmailClean = (order.customerEmail || '').toLowerCase();

    // Match phone or email
    const isPhoneMatch = orderPhoneClean.includes(cleanIdentifier) || cleanIdentifier.includes(orderPhoneClean);
    const isEmailMatch = orderEmailClean === cleanIdentifier;

    if (!isPhoneMatch && !isEmailMatch) {
      return {
        success: false,
        error: 'Order ID verified, but the phone number or email does not match our records for this parcel.',
      };
    }

    return { success: true, order };
  } catch (error) {
    console.error('Error tracking order:', error);
    return {
      success: false,
      error: 'Unable to connect to order tracking server. Please verify your connection or try again later.',
    };
  }
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('customerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function validateCouponCode(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discount: 0, message: 'Please enter a coupon code' };
  }

  // Try checking from initialCoupons
  const coupon = initialCoupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

  if (!coupon) {
    return { valid: false, discount: 0, message: `Coupon "${cleanCode}" is invalid or has expired` };
  }

  if (subtotal < coupon.minimumOrder) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount of Rs. ${coupon.minimumOrder.toLocaleString()} is required for this coupon`,
    };
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  } else {
    discount = coupon.value;
  }

  return {
    valid: true,
    discount,
    message: `Coupon "${coupon.code}" applied! You saved Rs. ${discount.toLocaleString()}`,
    coupon,
  };
}
