import React from 'react';
import {
  CheckCircle,
  Package,
  Phone,
  ArrowRight,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { Order } from '../types';
import { businessConfig } from '../config/businessConfig';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigate,
}) => {
  const isRaast = order.paymentMethod === 'raast';
  const whatsappInquiryMessage = encodeURIComponent(
    isRaast
      ? `Assalam-o-Alaikum, I placed Order #${order.orderId} for Rs. ${order.totalAmount.toLocaleString()} via Raast Instant Payment. My Transaction ID is ${order.transactionId || 'recorded'}. Here is my payment receipt screenshot.`
      : `Assalam-o-Alaikum, I just placed Order #${order.orderId} for Rs. ${order.totalAmount.toLocaleString()} on Cash on Delivery. Please confirm my order details.`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Order Successfully Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Shukriya, {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
            Your order has been recorded in our backend system. Our dispatch team in Lahore will verify and pack your parcel shortly.
          </p>
        </div>

        {/* Order ID Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-stone-900 font-mono text-sm sm:text-base font-extrabold shadow-2xs">
          <span>Order ID:</span>
          <span className="text-pink-600 select-all">{order.orderId}</span>
        </div>
      </div>

      {/* Immediate Next Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('track-order', order.orderId)}
          className="py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          id="confirmation-track-order-btn"
        >
          <Package className="w-4 h-4" />
          <span>Track This Order</span>
        </button>

        <a
          href={`https://wa.me/${businessConfig.helplineWhatsapp || businessConfig.whatsapp}?text=${whatsappInquiryMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors text-center"
          id="confirmation-whatsapp-btn"
        >
          <Phone className="w-4 h-4" />
          <span>WhatsApp Confirmation</span>
        </a>

        <button
          onClick={() => onNavigate('shop')}
          className="py-3 px-4 bg-white border border-stone-300 hover:border-stone-900 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          id="confirmation-continue-shopping-btn"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Order Details Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Delivery Summary */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <MapPin className="w-4 h-4 text-pink-600" />
            Shipping Destination
          </h2>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                Recipient
              </span>
              <span className="text-stone-900 font-bold text-sm">{order.customerName}</span>
            </div>

            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                Phone Number
              </span>
              <span className="text-stone-800 font-mono font-medium">{order.customerPhone}</span>
            </div>

            {order.customerEmail && (
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                  Email
                </span>
                <span className="text-stone-800">{order.customerEmail}</span>
              </div>
            )}

            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                Delivery Address
              </span>
              <span className="text-stone-800 leading-relaxed font-medium">
                {order.deliveryAddress}
                {order.area ? `, ${order.area}` : ''}, {order.city}
                {order.postalCode ? ` - ${order.postalCode}` : ''}
              </span>
            </div>

            {order.orderNotes && (
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-stone-600">
                <span className="font-semibold block text-[10px] uppercase text-stone-400">
                  Delivery Instructions:
                </span>
                "{order.orderNotes}"
              </div>
            )}
          </div>
        </div>

        {/* Payment & Order Status */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <CreditCard className="w-4 h-4 text-pink-600" />
            Payment & Status
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">Payment Method</span>
              <span className="font-bold text-stone-900">
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery (COD)'
                  : order.paymentMethod === 'raast'
                  ? 'Raast ID & QR Code Transfer'
                  : 'JazzCash'}
              </span>
            </div>

            {order.transactionId && (
              <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-100">
                <span className="text-stone-500 font-medium">Transaction ID (TRX)</span>
                <span className="font-mono font-bold text-pink-600 text-xs">
                  {order.transactionId}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">Payment Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                order.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {order.paymentStatus === 'pending' && order.paymentMethod === 'raast'
                  ? 'TRX Submitted (Pending Verification)'
                  : order.paymentStatus}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">Order Status</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 uppercase">
                {order.orderStatus}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">Estimated Delivery</span>
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                2 to 4 Business Days
              </span>
            </div>

            <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-start gap-2">
              <Truck className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
              <span>
                {order.paymentMethod === 'cod'
                  ? <>Please keep exact change of <strong>Rs. {order.totalAmount.toLocaleString()}</strong> ready at the time of delivery.</>
                  : <>Thank you for paying via Raast. If requested by our team, share your transfer screenshot on WhatsApp at <strong>{businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay}</strong>.</>}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Ordered List */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
        <h2 className="text-sm font-bold text-stone-900 pb-3 border-b border-stone-100">
          Items Ordered ({order.items.length})
        </h2>

        <div className="divide-y divide-stone-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0">
              <div className="flex items-center gap-3 min-w-0">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {item.productName}
                  </h4>
                  <div className="text-[11px] text-stone-500">
                    Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}{' '}
                    {item.selectedColor ? `• Color: ${item.selectedColor}` : ''}
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-stone-900 text-right shrink-0">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">
              Rs. {order.subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-stone-600">
            <span>Delivery Fee</span>
            <span className="font-semibold text-stone-900">
              {order.shippingCost === 0 ? 'FREE' : `Rs. ${order.shippingCost.toLocaleString()}`}
            </span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
              <span>-Rs. {order.discount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
            <span>Grand Total Due</span>
            <span className="text-pink-600 text-lg">
              Rs. {order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
