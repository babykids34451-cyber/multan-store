import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  AlertCircle,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { trackOrder } from '../services/orderService';
import { Order, OrderStatus } from '../types';
import { businessConfig } from '../config/businessConfig';

interface TrackOrderPageProps {
  initialOrderId?: string;
  onNavigate: (view: string) => void;
}

const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
  {
    key: 'pending',
    label: 'Order Placed',
    desc: 'Order received in our system. Awaiting verification.',
  },
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    desc: 'Order confirmed and scheduled with logistics team.',
  },
  {
    key: 'processing',
    label: 'Packing & Quality Check',
    desc: 'Products inspected and securely packed in our Lahore warehouse.',
  },
  {
    key: 'shipped',
    label: 'Out for Delivery',
    desc: 'Dispatched with courier partner. Delivery rider en route.',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    desc: 'Parcel received by recipient. Payment completed.',
  },
];

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  initialOrderId,
  onNavigate,
}) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || '');
  const [identifierInput, setIdentifierInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-search if initialOrderId is passed
  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
    }
  }, [initialOrderId]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) {
      setErrorMessage('Please enter your Order ID');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setTrackedOrder(null);

    const result = await trackOrder(orderIdInput, identifierInput);
    setLoading(false);

    if (result.success && result.order) {
      setTrackedOrder(result.order);
    } else {
      setErrorMessage(result.error || 'No matching order found.');
    }
  };

  const getStepStatus = (stepKey: OrderStatus) => {
    if (!trackedOrder) return 'pending';
    const statusOrder: OrderStatus[] = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
    ];
    const currentIndex = statusOrder.indexOf(trackedOrder.orderStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (trackedOrder.orderStatus === 'cancelled') {
      return 'cancelled';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-Time Logistics Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Track Your Shipment
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Enter your unique Order ID and the phone number or email you provided during checkout to see the current parcel status.
        </p>
      </div>

      {/* Tracker Lookup Form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
        <form onSubmit={handleTrackSubmit} className="space-y-4" id="track-order-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Order ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                placeholder="e.g. SHN-202609-4821"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl uppercase tracking-wider font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                id="track-order-id-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Customer Phone or Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={identifierInput}
                onChange={(e) => setIdentifierInput(e.target.value)}
                placeholder="e.g. 03001234567 or email"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                id="track-identifier-input"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-pink-600 disabled:bg-stone-400 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              id="track-submit-btn"
            >
              {loading ? (
                <span>Checking Database...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tracked Order Result View */}
      {trackedOrder && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
          {/* Top Bar Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Parcel Details
              </div>
              <div className="text-xl font-extrabold text-stone-900 flex items-center gap-2 mt-0.5">
                <span>Order #{trackedOrder.orderId}</span>
                <span className="text-xs px-2.5 py-0.5 bg-pink-100 text-pink-800 font-bold rounded-full">
                  {trackedOrder.orderStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Placed on {new Date(trackedOrder.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-stone-400">Total Payable at Doorstep</div>
              <div className="text-2xl font-extrabold text-pink-600">
                Rs. {trackedOrder.totalAmount.toLocaleString()}
              </div>
              <span className="text-[11px] text-stone-500 font-semibold uppercase">
                {trackedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'JazzCash'}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-6">Shipment Timeline</h3>
            <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-5 gap-3 relative">
              {statusSteps.map((step, idx) => {
                const stepState = getStepStatus(step.key);

                return (
                  <div key={step.key} className="flex sm:flex-col items-start gap-4 sm:gap-2 relative">
                    {/* Circle Indicator */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-xs transition-colors ${
                        stepState === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : stepState === 'active'
                          ? 'bg-pink-600 border-pink-600 text-white ring-4 ring-pink-100'
                          : 'bg-stone-100 border-stone-300 text-stone-400'
                      }`}
                    >
                      {stepState === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="sm:text-center sm:mt-1">
                      <div
                        className={`text-xs font-bold ${
                          stepState === 'active'
                            ? 'text-pink-600'
                            : stepState === 'completed'
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address & Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Deliver To
              </span>
              <p className="font-bold text-stone-900 mt-0.5">{trackedOrder.customerName}</p>
              <p className="text-stone-600 mt-0.5">{trackedOrder.deliveryAddress}, {trackedOrder.city}</p>
              <p className="text-stone-600 font-mono mt-0.5">{trackedOrder.customerPhone}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Payment & Billing
              </span>
              <p className="font-bold text-stone-900 mt-0.5">
                {trackedOrder.paymentMethod === 'cod'
                  ? 'Cash on Delivery (COD)'
                  : trackedOrder.paymentMethod === 'raast'
                  ? 'Raast ID / QR Transfer'
                  : 'JazzCash'}
              </p>
              {trackedOrder.transactionId && (
                <p className="font-mono text-pink-600 font-bold text-[11px] mt-0.5">
                  TRX: {trackedOrder.transactionId}
                </p>
              )}
              <p className="text-stone-600 mt-0.5">
                Status: <span className="font-semibold uppercase text-emerald-700">{trackedOrder.paymentStatus}</span> • Total: Rs. {(trackedOrder.totalAmount || trackedOrder.total || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Courier / Logistic Partner
              </span>
              <p className="font-bold text-stone-900 mt-0.5">TCS / Call Courier / Leopard</p>
              <p className="text-stone-600 mt-0.5">
                Tracking Active • Standard 2-4 Days Delivery
              </p>
              <a
                href={`https://wa.me/${businessConfig.helplineWhatsapp || businessConfig.whatsapp}?text=${encodeURIComponent(`Assalam-o-Alaikum, I need an update on my parcel Order #${trackedOrder.orderId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline mt-1"
              >
                <Phone className="w-3 h-3" />
                Ask Courier Update on WhatsApp
              </a>
            </div>
          </div>

          {/* Ordered Items summary */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase text-stone-500">
              Parcel Contents ({trackedOrder.items.length} items)
            </h4>
            <div className="divide-y divide-stone-100 text-xs">
              {trackedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="w-9 h-9 rounded object-cover bg-stone-100"
                      />
                    )}
                    <div>
                      <div className="font-bold text-stone-800">{item.productName}</div>
                      <div className="text-[11px] text-stone-400">
                        Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-stone-900">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
