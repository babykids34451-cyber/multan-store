import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  CreditCard,
  Phone,
  Tag,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  QrCode,
  Copy,
  Check,
  Building2,
  Smartphone,
  Info,
  Download,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { businessConfig } from '../config/businessConfig';
import { createOrderInBackend, generateOrderId } from '../services/orderService';
import {
  getRaastConfig,
  generateRaastQrDataUrl,
  RaastConfig,
} from '../services/raastService';
import { Order, PaymentMethod } from '../types';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onNavigate: (view: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onNavigate,
}) => {
  const {
    cart,
    subtotal,
    shipping,
    discount,
    total,
    appliedCoupon,
    clearCart,
    user,
    customerProfile,
    applyCoupon,
    removeCoupon,
    showToast,
  } = useStore();

  // Form Fields
  const [fullName, setFullName] = useState(
    customerProfile?.displayName || user?.displayName || ''
  );
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [email, setEmail] = useState(customerProfile?.email || user?.email || '');
  const [address, setAddress] = useState(customerProfile?.address || '');
  const [city, setCity] = useState(customerProfile?.city || 'Lahore');
  const [area, setArea] = useState(customerProfile?.area || '');
  const [postalCode, setPostalCode] = useState(customerProfile?.postalCode || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment method: 'cod' | 'raast'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Raast & QR Code state
  const [raastConfig, setRaastConfig] = useState<RaastConfig | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Raast configuration
  useEffect(() => {
    async function loadRaast() {
      const config = await getRaastConfig();
      setRaastConfig(config);
    }
    loadRaast();
  }, []);

  // Generate QR Code whenever Raast is selected or total changes
  useEffect(() => {
    async function updateQr() {
      if (!raastConfig) return;
      try {
        const url = await generateRaastQrDataUrl({
          raastId: raastConfig.raastId,
          accountTitle: raastConfig.accountTitle,
          amount: total,
          orderId: 'TEMP-REF',
        });
        setQrCodeUrl(url);
      } catch (e) {
        console.error('Failed to generate Raast QR code:', e);
      }
    }
    updateQr();
  }, [raastConfig, total]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key === 'raast' ? 'Raast ID' : 'IBAN'} to clipboard!`, 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Your cart is empty</h2>
        <p className="text-xs text-stone-500">
          Add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage('Please enter your full recipient name.');
      return false;
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid Pakistani phone number (e.g. 0300-1234567).');
      return false;
    }

    if (!address.trim() || address.trim().length < 8) {
      setErrorMessage('Please enter a complete delivery street address.');
      return false;
    }

    if (!city.trim()) {
      setErrorMessage('Please select or specify your delivery city.');
      return false;
    }

    if (paymentMethod === 'raast' && (!transactionId.trim() || transactionId.trim().length < 4)) {
      setErrorMessage(
        'Please enter your Transaction ID (TRX ID / Reference #) from your banking receipt after sending Rs. ' +
          total.toLocaleString() +
          ' via Raast.'
      );
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const orderId = generateOrderId();

    try {
      const orderItems = cart.map((item) => {
        const itemPrice = item.product.salePrice ?? item.product.price;
        return {
          productId: item.product.id,
          name: item.product.name,
          productName: item.product.name,
          sku: item.product.sku,
          price: itemPrice,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          size: item.selectedSize,
          selectedColor: item.selectedColor,
          color: item.selectedColor,
          image: item.product.images[0] || '',
          total: itemPrice * item.quantity,
        };
      });

      const newOrder: Omit<Order, 'createdAt' | 'updatedAt'> = {
        orderId,
        customerId: user?.uid || null,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
        deliveryAddress: address.trim(),
        city: city.trim(),
        area: area.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        orderNotes: orderNotes.trim() || undefined,
        items: orderItems,
        subtotal,
        shipping,
        shippingCost: shipping,
        discount,
        couponCode: appliedCoupon?.code,
        total,
        totalAmount: total,
        paymentMethod: paymentMethod === 'raast' ? 'raast' : 'cod',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        transactionId: paymentMethod === 'raast' ? transactionId.trim().toUpperCase() : undefined,
      };

      // Save real order to Firestore collection 'orders'
      const savedOrder = await createOrderInBackend(newOrder);
      clearCart();
      showToast(`Order ${savedOrder.orderId} placed successfully!`, 'success');
      onOrderSuccess(savedOrder);
    } catch (error) {
      console.error('Checkout error:', error);
      setIsSubmitting(false);
      setErrorMessage(
        'An error occurred while placing your order. Please verify your connection or try again.'
      );
    }
  };

  const activeRaast = raastConfig || {
    raastId: businessConfig.paymentSettings.raast.raastId,
    accountTitle: businessConfig.paymentSettings.raast.accountTitle,
    bankName: businessConfig.paymentSettings.raast.bankName,
    iban: businessConfig.paymentSettings.raast.iban,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          id="checkout-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} id="checkout-form">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-600" />
                  Delivery & Contact Information
                </h2>
                <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                  Step 1 of 2
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Full Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    id="checkout-full-name"
                  />
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                      id="checkout-phone"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Courier rider will call this number before delivery
                  </span>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tariq@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    id="checkout-email"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    For tracking updates and digital receipt
                  </span>
                </div>

                {/* City Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
                    id="checkout-city"
                  >
                    {businessConfig.deliverySettings.availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area / Sector */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Area / Sector / Phase
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. DHA Phase 5 / Gulberg III"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    id="checkout-area"
                  />
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Complete Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Apartment #, Street #, Nearest Landmark / Chowk"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    id="checkout-address"
                  />
                </div>

                {/* Delivery Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Special Delivery Instructions <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Ring the bell twice, leave at reception if unavailable"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    id="checkout-order-notes"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection Card */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-pink-600" />
                  Select Payment Method
                </h2>
                <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                  Step 2 of 2
                </span>
              </div>

              {/* Option 1: Cash on Delivery (COD) */}
              <label
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-stone-900 bg-stone-50 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 w-4 h-4 text-pink-600 focus:ring-pink-500 accent-stone-900"
                  id="radio-payment-cod"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900">
                      Cash on Delivery (COD)
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Pay in cash in Pakistani Rupees (PKR) directly to the delivery rider when your parcel arrives at your doorstep. No advance payment required.
                  </p>
                </div>
              </label>

              {/* Option 2: Raast ID & QR Code Instant Payment */}
              <label
                className={`flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'raast'
                    ? 'border-pink-600 bg-pink-50/20 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="raast"
                    checked={paymentMethod === 'raast'}
                    onChange={() => setPaymentMethod('raast')}
                    className="mt-1 w-4 h-4 text-pink-600 focus:ring-pink-500 accent-pink-600"
                    id="radio-payment-raast"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-pink-600" />
                        <span>Raast ID & QR Code (Instant Bank Transfer)</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        0% SBP Fee • All Banks
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Instant transfer via any Pakistani banking app (Meezan, HBL, UBL, Alfalah), Nayapay, Sadapay, Easypaisa, or JazzCash using Raast ID or Bank QR.
                    </p>
                  </div>
                </div>

                {/* Raast QR Code & Account Box (Shown when selected) */}
                {paymentMethod === 'raast' && (
                  <div className="mt-3 p-5 rounded-xl bg-white border border-pink-200 shadow-sm space-y-5 cursor-default">
                    {/* Header Pill */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>SBP Raast Instant Payment Gateway</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-md">
                        Rs. {total.toLocaleString()} Due
                      </span>
                    </div>

                    {/* QR Code & Account Details Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* Left: Scannable QR Code */}
                      <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl border border-stone-200 text-center">
                        {qrCodeUrl ? (
                          <div className="relative group">
                            <img
                              src={qrCodeUrl}
                              alt="Scan Raast QR Code"
                              className="w-40 h-40 object-contain rounded-lg border border-stone-200 bg-white p-1.5 shadow-2xs"
                            />
                            <div className="mt-2 text-[10px] font-bold text-stone-600 flex items-center justify-center gap-1">
                              <QrCode className="w-3 h-3 text-pink-600" />
                              <span>Scan with any Pakistani Bank App</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-40 h-40 flex items-center justify-center bg-stone-200 rounded-lg text-xs text-stone-500">
                            Generating QR...
                          </div>
                        )}
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium mt-2">
                          Compatible: Easypaisa, JazzCash, Nayapay, HBL, Meezan
                        </span>
                      </div>

                      {/* Right: Copyable Raast ID and Bank Info */}
                      <div className="md:col-span-7 space-y-3 text-xs">
                        {/* Raast ID Box */}
                        <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">
                              Raast ID (Mobile / P2M)
                            </span>
                            <span className="font-mono font-black text-stone-900 text-sm sm:text-base">
                              {activeRaast.raastId}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(activeRaast.raastId, 'raast');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-pink-600 text-stone-700 hover:text-pink-600 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedKey === 'raast' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy ID</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Account Title & Bank */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200">
                            <span className="text-[9px] uppercase font-bold text-stone-400 block">
                              Account Title
                            </span>
                            <span className="font-bold text-stone-800 truncate block">
                              {activeRaast.accountTitle}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200">
                            <span className="text-[9px] uppercase font-bold text-stone-400 block">
                              Bank Name
                            </span>
                            <span className="font-bold text-stone-800 truncate block">
                              {activeRaast.bankName}
                            </span>
                          </div>
                        </div>

                        {/* IBAN Box */}
                        {activeRaast.iban && (
                          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                                IBAN (For Direct Bank Transfer)
                              </span>
                              <span className="font-mono font-bold text-stone-900 text-xs truncate block">
                                {activeRaast.iban}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                copyToClipboard(activeRaast.iban, 'iban');
                              }}
                              className="shrink-0 px-2 py-1 rounded-lg bg-white border border-stone-300 hover:border-pink-600 text-stone-700 hover:text-pink-600 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedKey === 'iban' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy IBAN</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                      <div className="font-bold text-stone-800 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-pink-600" />
                        <span>3 Easy Steps to Complete Your Payment:</span>
                      </div>
                      <ol className="list-decimal list-inside text-[11px] text-stone-600 space-y-1 pl-1">
                        <li>
                          Open your banking or wallet app (Easypaisa, JazzCash, Nayapay, Sadapay, Meezan, HBL, etc.).
                        </li>
                        <li>
                          Choose <strong>Send Money &gt; Raast</strong> (or Scan QR above) and transfer exact amount: <strong>Rs. {total.toLocaleString()}</strong>.
                        </li>
                        <li>
                          Copy the <strong>Transaction ID (TRX ID)</strong> from your app receipt and paste it in the box below.
                        </li>
                      </ol>
                    </div>

                    {/* Transaction ID Input */}
                    <div className="pt-2 border-t border-stone-100">
                      <label className="block text-xs font-bold text-stone-900 mb-1">
                        Enter Transaction ID (TRX ID / Reference Number) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        placeholder="e.g. 24891048201 or TRX-8921"
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-pink-50/40 border border-pink-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        id="checkout-trx-id"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        You will find this 6 to 12 digit reference number in your banking confirmation SMS or receipt screen.
                      </span>
                    </div>

                    {/* WhatsApp verification notice */}
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>WhatsApp payment proof helpline: <strong>{businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay}</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-5 sticky top-28">
              <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>Order Summary ({cart.length} items)</span>
                <span className="text-xs font-semibold text-stone-500">PKR</span>
              </h2>

              {/* Items preview list */}
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1 space-y-2">
                {cart.map((item, idx) => {
                  const price = item.product.salePrice ?? item.product.price;
                  return (
                    <div key={idx} className="flex gap-3 pt-2 first:pt-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-stone-500">
                          Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-stone-900 text-right">
                        Rs. {(price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon voucher section */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon "{appliedCoupon.code}" applied (-Rs. {discount.toLocaleString()})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Discount code (e.g. SHAAN10)"
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase tracking-wider font-mono"
                      id="checkout-coupon-input"
                    />
                    <button
                      type="button"
                      disabled={couponLoading || !couponCode.trim()}
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      id="checkout-apply-coupon-btn"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600">{couponError}</p>
                  )}
                </div>
              )}

              {/* Calculation breakdown */}
              <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1">
                    <span>Shipping Charges</span>
                    {subtotal >= businessConfig.deliverySettings.freeDeliveryThreshold && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                        Free Promotion
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-stone-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `Rs. ${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Applied</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-3 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="text-xl text-pink-600 font-black">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-stone-900 hover:bg-pink-600 disabled:bg-stone-400 text-white text-sm font-extrabold rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                id="place-order-submit-btn"
              >
                {isSubmitting ? (
                  <span>Recording Order in Backend...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'cod'
                        ? `Place COD Order • Rs. ${total.toLocaleString()}`
                        : `Confirm Raast Payment • Rs. ${total.toLocaleString()}`}
                    </span>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="space-y-2 pt-2 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real orders stored securely in cloud database.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Need help? WhatsApp helpline: <strong>{businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
