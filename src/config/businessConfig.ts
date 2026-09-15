export const businessConfig = {
  businessName: 'Shaan Online Store',
  tagline: 'Premium Pakistani Fashion, Lifestyle & Everyday Essentials',
  shortName: 'Shaan',
  logoUrl: '', // Custom logo image URL or base64 data URL
  logoIconText: 'ش', // Fallback Urdu/English character/icon if no image is uploaded
  currency: 'Rs.',
  currencyCode: 'PKR',
  aboutText: "Pakistan's premier destination for curated artisanal footwear, luxury pret kurtas, designer unstitched lawn, genuine full-grain leather, and everyday tech accessories.",
  
  // Contact & Support
  phone: '+92 300 1234567',
  phoneDisplay: '0300-1234567',

  // Order on WhatsApp (Customer direct order desk)
  orderWhatsapp: '923001234567', // E.164 digits without plus for wa.me link
  orderWhatsappDisplay: '+92 300 1234567', // Formatted for display

  // Helpline WhatsApp (Customer support, Tracking inquiries & Raast payment verification)
  helplineWhatsapp: '923001234567', // E.164 digits without plus for wa.me link
  helplineWhatsappDisplay: '+92 300 1234567', // Formatted for display

  // Backwards-compatible aliases
  whatsapp: '923001234567', // E.164 without plus for wa.me URL
  whatsappDisplay: '+92 300 1234567',
  email: 'support@shaanstore.pk',

  // Physical Address & Location
  address: 'Shop 14-B, Main Boulevard, Gulberg III',
  city: 'Lahore',
  country: 'Pakistan',
  postalCode: '54000',

  // Timings & Working Hours
  businessHours: 'Mon - Sat: 10:00 AM - 9:00 PM PKT',
  workingDays: 'Monday - Saturday',
  workingTime: '10:00 AM - 9:00 PM PKT',
  closedDays: 'Sunday (Closed - Online Orders Open 24/7)',

  // Copyright & Legal
  copyrightText: 'All rights reserved.',
  
  // Social links
  socialLinks: {
    facebook: 'https://facebook.com/shaanstorepk',
    instagram: 'https://instagram.com/shaanstorepk',
    tiktok: 'https://tiktok.com/@shaanstorepk',
    youtube: '',
  },

  // Delivery configuration
  deliverySettings: {
    deliveryEnabled: true,
    deliveryCharge: 250, // Standard PKR 250 shipping across Pakistan
    freeDeliveryThreshold: 3000, // Free shipping on orders over Rs. 3,000
    estimatedDays: '2 - 4 Business Days',
    availableCities: [
      'Karachi',
      'Lahore',
      'Islamabad',
      'Rawalpindi',
      'Faisalabad',
      'Multan',
      'Peshawar',
      'Quetta',
      'Sialkot',
      'Gujranwala',
      'Hyderabad',
      'Abbottabad',
      'Bahawalpur',
      'Sargodha',
      'Sukkur',
      'Sahiwal',
      'Wah Cantt',
      'Rahim Yar Khan',
      'Other City (Pakistan)'
    ]
  },

  popularCities: [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Abbottabad',
    'Bahawalpur',
    'Sargodha',
    'Sukkur',
    'Sahiwal',
    'Wah Cantt',
    'Rahim Yar Khan',
    'Other City (Pakistan)'
  ],

  // Payment settings
  paymentSettings: {
    cod: {
      enabled: true,
      label: 'Cash on Delivery (COD)',
      description: 'Pay with cash at your doorstep when your parcel arrives. Available across all cities of Pakistan.'
    },
    raast: {
      enabled: true,
      label: 'Raast ID & QR Code (Instant Transfer)',
      description: 'Instant 0% fee transfer via any Pakistani banking app, Nayapay, Sadapay, Easypaisa, or JazzCash app using Raast ID or Bank QR.',
      raastId: '03124352369',
      accountTitle: 'Muhammad Muzamil',
      bankName: 'JS Bank / ZINDIGI',
      iban: 'PK70JSBL9999903124352369',
      branch: 'Main Branch'
    }
  }
};

const SETTINGS_STORAGE_KEY = 'shaan_store_settings_v2';

export const loadStoredSettings = () => {
  try {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.orderWhatsapp) businessConfig.orderWhatsapp = parsed.orderWhatsapp;
      if (parsed.orderWhatsappDisplay) businessConfig.orderWhatsappDisplay = parsed.orderWhatsappDisplay;
      if (parsed.helplineWhatsapp) businessConfig.helplineWhatsapp = parsed.helplineWhatsapp;
      if (parsed.helplineWhatsappDisplay) businessConfig.helplineWhatsappDisplay = parsed.helplineWhatsappDisplay;
      
      // Sync backward compatibility
      businessConfig.whatsapp = parsed.helplineWhatsapp || parsed.orderWhatsapp || businessConfig.whatsapp;
      businessConfig.whatsappDisplay = parsed.helplineWhatsappDisplay || parsed.orderWhatsappDisplay || businessConfig.whatsappDisplay;

      if (parsed.bankName) businessConfig.paymentSettings.raast.bankName = parsed.bankName;
      if (parsed.accountTitle) businessConfig.paymentSettings.raast.accountTitle = parsed.accountTitle;
      if (parsed.raastId) businessConfig.paymentSettings.raast.raastId = parsed.raastId;
      if (parsed.iban) businessConfig.paymentSettings.raast.iban = parsed.iban;
      if (parsed.freeDeliveryThreshold !== undefined) businessConfig.deliverySettings.freeDeliveryThreshold = Number(parsed.freeDeliveryThreshold);
      if (parsed.deliveryCharge !== undefined) businessConfig.deliverySettings.deliveryCharge = Number(parsed.deliveryCharge);
      if (parsed.phone) businessConfig.phone = parsed.phone;
      if (parsed.phoneDisplay) businessConfig.phoneDisplay = parsed.phoneDisplay;
      if (parsed.email) businessConfig.email = parsed.email;

      // Footer, Branding, Address & Operating Hours
      if (parsed.businessName) businessConfig.businessName = parsed.businessName;
      if (parsed.shortName) businessConfig.shortName = parsed.shortName;
      if (parsed.logoUrl !== undefined) businessConfig.logoUrl = parsed.logoUrl;
      if (parsed.logoIconText !== undefined) businessConfig.logoIconText = parsed.logoIconText;
      if (parsed.tagline) businessConfig.tagline = parsed.tagline;
      if (parsed.aboutText) businessConfig.aboutText = parsed.aboutText;
      if (parsed.address) businessConfig.address = parsed.address;
      if (parsed.city) businessConfig.city = parsed.city;
      if (parsed.country) businessConfig.country = parsed.country;
      if (parsed.postalCode) businessConfig.postalCode = parsed.postalCode;
      if (parsed.businessHours) businessConfig.businessHours = parsed.businessHours;
      if (parsed.workingDays) businessConfig.workingDays = parsed.workingDays;
      if (parsed.workingTime) businessConfig.workingTime = parsed.workingTime;
      if (parsed.closedDays) businessConfig.closedDays = parsed.closedDays;
      if (parsed.copyrightText) businessConfig.copyrightText = parsed.copyrightText;

      // Social Links
      if (parsed.facebook !== undefined) businessConfig.socialLinks.facebook = parsed.facebook;
      if (parsed.instagram !== undefined) businessConfig.socialLinks.instagram = parsed.instagram;
      if (parsed.tiktok !== undefined) businessConfig.socialLinks.tiktok = parsed.tiktok;
      if (parsed.youtube !== undefined) businessConfig.socialLinks.youtube = parsed.youtube;
    }
  } catch (e) {
    console.error('Error loading stored store settings:', e);
  }
};

export const saveStoredSettings = (settings: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('shaan_settings_updated', { detail: settings }));
    }
    loadStoredSettings();
  } catch (e) {
    console.error('Error saving store settings:', e);
  }
};

// Auto-run on module load
if (typeof window !== 'undefined') {
  loadStoredSettings();
}
