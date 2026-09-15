import React, { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I have an inquiry about shopping on ${businessConfig.businessName}.`
  );

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40">
      {/* Floating Action Menu */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 animate-scaleIn">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  {businessConfig.businessName}
                </h4>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  Online • Typically replies instantly
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-stone-600 space-y-2">
            <p className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-[11px] leading-relaxed">
              Hello! 👋 Need help choosing a size, tracking an existing shipment, or placing a direct Cash on Delivery order? Chat with us on WhatsApp!
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <a
              href={`https://wa.me/${businessConfig.helplineWhatsapp || businessConfig.whatsapp}?text=${defaultMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              id="floating-whatsapp-helpline-btn"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Helpline Chat ({businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay})</span>
            </a>

            <a
              href={`https://wa.me/${businessConfig.orderWhatsapp || businessConfig.whatsapp}?text=${encodeURIComponent('Assalam-o-Alaikum! I would like to place an order via WhatsApp.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white font-semibold text-[11px] rounded-xl flex items-center justify-center gap-2 transition-colors"
              id="floating-whatsapp-order-btn"
            >
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>Order Desk ({businessConfig.orderWhatsappDisplay || businessConfig.whatsappDisplay})</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer font-bold text-xs"
        id="floating-whatsapp-toggle-btn"
        title="WhatsApp Support & Fast Orders"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        <span className="hidden sm:inline">WhatsApp Help</span>
      </button>
    </div>
  );
};
