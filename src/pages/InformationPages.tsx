import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { businessConfig } from '../config/businessConfig';

interface InfoPageProps {
  type: 'about' | 'contact' | 'faq' | 'shipping' | 'returns' | 'privacy' | 'terms';
  onNavigate: (view: string, param?: string) => void;
}

export const InformationPages: React.FC<InfoPageProps> = ({ type, onNavigate }) => {
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (type === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-600">
            Our Story & Heritage
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            About {businessConfig.businessName}
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Proudly based in Lahore, Pakistan, bringing you authentic artisanal craftsmanship, refined traditional silhouettes, and modern essentials with nationwide Cash on Delivery.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden aspect-21/9 bg-stone-100 border border-stone-200">
          <img
            src="https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=1200&auto=format&fit=crop&q=80"
            alt="Authentic Pakistani Craft"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-4 text-stone-700">
          <h3 className="text-lg font-bold text-stone-900">Rooted in Pakistani Craftsmanship</h3>
          <p>
            {businessConfig.businessName} was founded with a singular purpose: to bridge the gap between skilled indigenous Pakistani craftspeople and discerning online customers seeking uncompromising quality without inflated retail markups.
          </p>
          <p>
            From the historic leather guilds of Charsadda crafting authentic tyre-sole Peshawari chappals to Multani master cobblers embroidering zari khussas, and the finest jacquard looms weaving luxury summer lawn in Faisalabad — every piece in our catalog reflects authentic heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-200 text-center">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <Truck className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <h4 className="font-bold text-stone-900 text-sm">Nationwide Reach</h4>
            <p className="text-xs text-stone-500 mt-1">Delivering to all 150+ Pakistani cities & tehsils via express couriers.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-stone-900 text-sm">Quality Inspected</h4>
            <p className="text-xs text-stone-500 mt-1">Every parcel is triple-inspected for stitching, finish, and hardware.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-bold text-stone-900 text-sm">Human Support</h4>
            <p className="text-xs text-stone-500 mt-1">Real Pakistani team ready on WhatsApp to assist with sizes and delivery.</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'contact') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-600">
            Helpline & Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Contact Customer Support
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Have a question about an order, size guidance, or delivery time? We are here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-2xs">
              <h3 className="text-sm font-bold text-stone-900 pb-3 border-b border-stone-100">
                Direct Contact Channels
              </h3>

              <div className="space-y-4 text-xs">
                <a
                  href={`https://wa.me/${businessConfig.helplineWhatsapp || businessConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold">Customer Helpline WhatsApp</div>
                    <div className="text-[11px] text-emerald-700">{businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay}</div>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${businessConfig.orderWhatsapp || businessConfig.whatsapp}?text=${encodeURIComponent('Assalam-o-Alaikum, I want to place a quick order.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 hover:bg-rose-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-bold">Order on WhatsApp Desk</div>
                    <div className="text-[11px] text-rose-700">{businessConfig.orderWhatsappDisplay || businessConfig.whatsappDisplay}</div>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800">
                  <Phone className="w-5 h-5 text-stone-600 shrink-0" />
                  <div>
                    <div className="font-bold">Phone Support</div>
                    <div className="text-[11px] text-stone-600">{businessConfig.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800">
                  <Mail className="w-5 h-5 text-stone-600 shrink-0" />
                  <div>
                    <div className="font-bold">Email Inquiries</div>
                    <div className="text-[11px] text-stone-600">{businessConfig.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800">
                  <MapPin className="w-5 h-5 text-stone-600 shrink-0" />
                  <div>
                    <div className="font-bold">Head Office & Dispatch Center</div>
                    <div className="text-[11px] text-stone-600">
                      {businessConfig.address}, {businessConfig.city}, Pakistan
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800">
                  <Clock className="w-5 h-5 text-stone-600 shrink-0" />
                  <div>
                    <div className="font-bold">Business Hours</div>
                    <div className="text-[11px] text-stone-600">{businessConfig.businessHours}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs">
            <h3 className="text-sm font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
              Send us a Message
            </h3>

            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-stone-900">Message Received!</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Thank you for reaching out. A customer support representative will contact you via WhatsApp or phone shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Ayesha Khan"
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Message / Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How can we help you today?"
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 hover:bg-pink-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  id="contact-form-submit"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'faq') {
    const faqs = [
      {
        q: 'How does Cash on Delivery (COD) work?',
        a: 'With Cash on Delivery, you pay nothing online. When the courier delivery rider brings your parcel to your address in Karachi, Lahore, Islamabad, or any other Pakistani city, you hand over the exact cash amount in Pakistani Rupees (PKR) and receive your package.',
      },
      {
        q: 'What are the delivery charges and when is delivery free?',
        a: `Standard delivery across Pakistan is Rs. ${businessConfig.deliverySettings.deliveryCharge}. However, if your cart subtotal is Rs. ${businessConfig.deliverySettings.freeDeliveryThreshold.toLocaleString()} or more, you automatically receive 100% FREE delivery!`,
      },
      {
        q: 'How long does shipment take to arrive?',
        a: 'Orders within Lahore and Punjab are typically delivered in 2 to 3 business days. Deliveries to Karachi, Islamabad, Rawalpindi, Peshawar, Quetta, and other cities take 3 to 4 business days.',
      },
      {
        q: 'Can I pay online using Raast ID or QR Code instead of COD?',
        a: 'Yes! We support State Bank of Pakistan (SBP) Raast Instant Payment with 0% fee. You can scan our dynamic QR Code or transfer to our Raast ID / IBAN using any Pakistani banking or wallet app (Easypaisa, JazzCash, Nayapay, Sadapay, Meezan, HBL, UBL). Simply paste your Transaction ID (TRX ID) at checkout to confirm.',
      },
      {
        q: 'What is your Exchange & Return policy?',
        a: 'We offer a hassle-free 7-Day Exchange Policy. If you receive the incorrect size, or if an item is defective, simply reach out to our WhatsApp team at 0300-1234567 with your Order ID, and we will arrange a replacement.',
      },
      {
        q: 'Can I order directly on WhatsApp without using the website checkout?',
        a: 'Yes! On any product page or via our floating WhatsApp button, you can tap "Order on WhatsApp" to send product details directly to our customer support agent who will register your COD order immediately.',
      },
    ];

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-600">
            Got Questions?
          </span>
          <h1 className="text-3xl font-extrabold text-stone-900">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-stone-500">
            Everything you need to know about shopping, shipping, and Cash on Delivery.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-stone-900 hover:text-pink-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-pink-600' : ''
                  }`}
                />
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Legal & Policy Pages
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
        {type === 'shipping' && 'Shipping & Delivery Policy'}
        {type === 'returns' && '7-Day Return & Exchange Policy'}
        {type === 'privacy' && 'Privacy Policy'}
        {type === 'terms' && 'Terms & Conditions of Service'}
      </h1>

      <div className="prose prose-stone text-xs leading-relaxed space-y-4 text-stone-600 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200">
        {type === 'shipping' && (
          <>
            <p>
              At <strong>{businessConfig.businessName}</strong>, we deliver nationwide to all cities, towns, and villages across Pakistan.
            </p>
            <h4 className="font-bold text-stone-900">1. Delivery Timeline</h4>
            <p>
              Standard courier transit time is 2 to 4 business days. Orders placed before 3:00 PM are processed and handed over to courier partners (TCS, Call Courier, Leopard) on the same day.
            </p>
            <h4 className="font-bold text-stone-900">2. Shipping Charges</h4>
            <p>
              Flat delivery charge of <strong>Rs. {businessConfig.deliverySettings.deliveryCharge}</strong> applies to all orders under Rs. {businessConfig.deliverySettings.freeDeliveryThreshold.toLocaleString()}. Orders above this threshold qualify for <strong>FREE DELIVERY</strong>.
            </p>
            <h4 className="font-bold text-stone-900">3. Cash on Delivery Procedure</h4>
            <p>
              Please keep the exact order amount ready in PKR when the delivery rider arrives. You may inspect the outer flyer seal before receiving.
            </p>
          </>
        )}

        {type === 'returns' && (
          <>
            <p>
              We want you to love your purchase. If you need to exchange an item, we offer a simple 7-day policy:
            </p>
            <h4 className="font-bold text-stone-900">1. Eligibility</h4>
            <p>
              Items must be unused, unwashed, and in their original packaging with tags intact. Handcrafted Peshawari chappals or khussas must show no wear on the outer sole.
            </p>
            <h4 className="font-bold text-stone-900">2. How to Request an Exchange</h4>
            <p>
              Simply send a message to our WhatsApp helpline at <strong>{businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay}</strong> with your Order ID and photo of the item. Our team will guide you through the process.
            </p>
          </>
        )}

        {type === 'privacy' && (
          <>
            <p>
              Your privacy is paramount. We only collect customer information necessary to fulfill orders and communicate delivery status:
            </p>
            <h4 className="font-bold text-stone-900">1. Data Collected</h4>
            <p>
              Name, phone number, shipping address, and email are collected strictly for logistics, courier dispatch, and SMS updates.
            </p>
            <h4 className="font-bold text-stone-900">2. No Third-Party Resale</h4>
            <p>
              We do not sell, rent, or trade your personal data with third-party advertisers. All orders and customer profiles are stored securely in cloud infrastructure.
            </p>
          </>
        )}

        {type === 'terms' && (
          <>
            <p>
              By accessing or placing an order on <strong>{businessConfig.businessName}</strong>, you agree to the following terms:
            </p>
            <h4 className="font-bold text-stone-900">1. Order Acceptance</h4>
            <p>
              Orders are confirmed upon phone or SMS verification by our dispatch team. We reserve the right to cancel unverified orders or duplicate submissions.
            </p>
            <h4 className="font-bold text-stone-900">2. Pricing & Availability</h4>
            <p>
              All prices are listed in Pakistani Rupees (PKR) and include all applicable taxes.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
