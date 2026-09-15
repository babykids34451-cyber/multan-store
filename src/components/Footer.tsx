import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Building2,
  Facebook,
  Instagram,
  Youtube,
  Globe,
} from 'lucide-react';
import { businessConfig } from '../config/businessConfig';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  // Listen for live settings updates from Admin Panel
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleSettingsUpdated = () => {
      setTick((prev) => prev + 1);
    };
    window.addEventListener('shaan_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('shaan_settings_updated', handleSettingsUpdated);
    };
  }, []);

  return (
    <footer className="w-full bg-slate-950 text-slate-300 pt-10 sm:pt-16 pb-10 sm:pb-12 border-t border-slate-800">
      {/* Guarantees Strip */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8 sm:pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Cash on Delivery (COD)
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Doorstep cash delivery across Karachi, Lahore, Islamabad, Peshawar & 250+ Pakistani cities.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                SBP Raast (0% Fee)
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Instant digital transfer via {businessConfig.paymentSettings.raast.bankName} (Raast ID: {businessConfig.paymentSettings.raast.raastId}).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                7-Day Easy Exchange
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Hassle-free size or defective product exchanges with dedicated courier pickup support.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                100% Genuine Quality
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Authentic Pakistani handcraft, pure leather, and guaranteed high thread count fabrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {businessConfig.logoUrl ? (
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-700 overflow-hidden flex items-center justify-center shadow-md p-1 shrink-0">
                  <img
                    src={businessConfig.logoUrl}
                    alt={businessConfig.businessName}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-rose-600/30 shrink-0">
                  <span>{businessConfig.logoIconText || 'ش'}</span>
                </div>
              )}
              <div>
                <span className="text-2xl font-black tracking-tight text-white block leading-none">
                  {businessConfig.businessName}
                </span>
                {businessConfig.tagline && (
                  <span className="text-[10px] text-rose-400 font-semibold tracking-wide block mt-1">
                    {businessConfig.tagline}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {businessConfig.aboutText || "Pakistan's premier destination for curated artisanal footwear, luxury pret kurtas, designer unstitched lawn, genuine full-grain leather, and everyday tech accessories."}
            </p>

            <div className="pt-2 text-xs space-y-2.5">
              {/* Physical Address */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block text-[11px] uppercase tracking-wider text-slate-400">Store & Office Address</span>
                  <span>{businessConfig.address}{businessConfig.city ? `, ${businessConfig.city}` : ''}{businessConfig.country ? `, ${businessConfig.country}` : ''}{businessConfig.postalCode ? ` - ${businessConfig.postalCode}` : ''}</span>
                </div>
              </div>

              {/* Working Days, Dates & Timings */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block text-[11px] uppercase tracking-wider text-slate-400">Store Timings & Working Days</span>
                  <span>{businessConfig.workingDays || 'Mon - Sat'}: {businessConfig.workingTime || businessConfig.businessHours}</span>
                  {businessConfig.closedDays && (
                    <span className="block text-[11px] text-amber-300/90 font-medium mt-0.5">
                      • {businessConfig.closedDays}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Channels */}
            {(businessConfig.socialLinks.facebook || businessConfig.socialLinks.instagram || businessConfig.socialLinks.tiktok || businessConfig.socialLinks.youtube) && (
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                  Follow Us Online
                </span>
                <div className="flex items-center gap-2">
                  {businessConfig.socialLinks.instagram && (
                    <a
                      href={businessConfig.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-400 flex items-center justify-center transition-colors border border-slate-800"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {businessConfig.socialLinks.facebook && (
                    <a
                      href={businessConfig.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-400 flex items-center justify-center transition-colors border border-slate-800"
                      title="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {businessConfig.socialLinks.tiktok && (
                    <a
                      href={businessConfig.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-black hover:text-white text-slate-400 flex items-center justify-center transition-colors border border-slate-800 font-bold text-xs"
                      title="TikTok"
                    >
                      TT
                    </a>
                  )}
                  {businessConfig.socialLinks.youtube && (
                    <a
                      href={businessConfig.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-600 hover:text-white text-slate-400 flex items-center justify-center transition-colors border border-slate-800"
                      title="YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-shop-all"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'womens-fashion')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-cat-women"
                >
                  Women's Lawn & Pret
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'mens-apparel')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-cat-men"
                >
                  Men's Kurta & Formal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'footwear-chappal')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-cat-footwear"
                >
                  Peshawari Chappal & Khussa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'leather-accessories')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-cat-leather"
                >
                  Genuine Leather Bags & Wallets
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('track-order')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  id="footer-track-order"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-contact-us"
                >
                  Contact & WhatsApp Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-faq"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shipping-policy')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-shipping-policy"
                >
                  Shipping & Delivery Info
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('return-policy')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  id="footer-return-policy"
                >
                  Returns & Exchange Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={`https://wa.me/${businessConfig.helplineWhatsapp || businessConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                id="footer-whatsapp-helpline-box"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">Helpline WhatsApp</div>
                  <div className="text-[10px] text-emerald-400 font-mono">{businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay}</div>
                </div>
              </a>

              <a
                href={`https://wa.me/${businessConfig.orderWhatsapp || businessConfig.whatsapp}?text=${encodeURIComponent('Assalam-o-Alaikum, I want to place a direct order on Shaan Store.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                id="footer-whatsapp-order-box"
              >
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">Order on WhatsApp Desk</div>
                  <div className="text-[10px] text-rose-400 font-mono">{businessConfig.orderWhatsappDisplay || businessConfig.whatsappDisplay}</div>
                </div>
              </a>

              {businessConfig.phone && (
                <div className="flex items-center gap-2 text-slate-300 pt-1">
                  <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                  <a href={`tel:${businessConfig.phone}`} className="hover:text-white font-mono">
                    {businessConfig.phoneDisplay || businessConfig.phone}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-300 pt-0.5">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <a href={`mailto:${businessConfig.email}`} className="hover:text-white truncate">
                  {businessConfig.email}
                </a>
              </div>

              <div className="pt-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2 font-bold">
                  Payment Accepted
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded-md text-[10px] font-black">
                    Cash on Delivery
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 text-amber-300 border border-slate-700 rounded-md text-[10px] font-black">
                    Raast: {businessConfig.paymentSettings.raast.bankName}
                  </span>
                  <span className="px-2.5 py-1 bg-red-950/60 text-red-300 border border-red-800/60 rounded-md text-[10px] font-black">
                    JazzCash
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Legal links */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {businessConfig.businessName}. {businessConfig.copyrightText || 'All rights reserved.'}</p>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onNavigate('privacy-policy')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
            id="footer-privacy-link"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
            id="footer-terms-link"
          >
            Terms & Conditions
          </button>
        </div>
      </div>
    </footer>
  );
};
