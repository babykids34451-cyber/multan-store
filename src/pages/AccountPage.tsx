import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  MapPin,
  Phone,
  Mail,
  Save,
  LogOut,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { businessConfig } from '../config/businessConfig';
import { getCustomerOrders } from '../services/orderService';
import { Order } from '../types';

interface AccountPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const {
    user,
    customerProfile,
    updateProfileData,
    signInWithGoogle,
    signOutUser,
  } = useStore();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [postalCode, setPostalCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sync state with customer profile
  useEffect(() => {
    if (customerProfile) {
      setDisplayName(customerProfile.displayName || user?.displayName || '');
      setPhone(customerProfile.phone || '');
      setAddress(customerProfile.address || '');
      setCity(customerProfile.city || 'Lahore');
      setPostalCode(customerProfile.postalCode || '');
    } else if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [customerProfile, user]);

  // Fetch past orders if user is authenticated
  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const pastOrders = await getCustomerOrders(user.uid);
        setOrders(pastOrders);
      } catch (err) {
        console.warn('Could not fetch past orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfileData({
      displayName,
      phone,
      address,
      city,
      postalCode,
    });
    setIsSaving(false);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-600">
          <UserIcon className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-stone-900">Customer Account</h1>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Sign in with your Google account to save your delivery addresses, view order history, and speed up checkout.
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          id="account-signin-google-btn"
        >
          <UserIcon className="w-4 h-4" />
          <span>Sign In with Google</span>
        </button>

        <p className="text-[11px] text-stone-400">
          Guest checkout is always supported on {businessConfig.businessName}. You can place orders on Cash on Delivery without creating an account.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Overview Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-200 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center text-xl font-bold">
              {(displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold text-stone-900">{displayName || 'Customer'}</h1>
            <p className="text-xs text-stone-500">{user.email}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Shopper
            </span>
          </div>
        </div>

        <button
          onClick={signOutUser}
          className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          id="account-signout-btn"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Settings Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-600" />
              Saved Delivery Details
            </h2>
            <span className="text-[11px] text-stone-400">Autofills at checkout</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Street, Area"
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {businessConfig.popularCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 54000"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-pink-600 disabled:bg-stone-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              id="save-profile-btn"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Order History */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-600" />
              My Orders ({orders.length})
            </h2>
            <button
              onClick={() => onNavigate('track-order')}
              className="text-[11px] font-bold text-pink-600 hover:underline"
            >
              Track by ID
            </button>
          </div>

          {loadingOrders ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Loading your past orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500">
                You haven't placed any orders with this account yet.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-4 py-2 bg-stone-900 hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="p-3.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50/50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        #{order.orderId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • Rs. {order.totalAmount.toLocaleString()} ({order.paymentMethod.toUpperCase()})
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('track-order', order.orderId)}
                    className="px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-900 text-stone-800 text-[11px] font-bold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <span>Track</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
