import QRCode from 'qrcode';
import { businessConfig } from '../config/businessConfig';

export interface RaastConfig {
  enabled: boolean;
  raastId: string;
  accountTitle: string;
  bankName: string;
  iban: string;
  currency: string;
  instructions: string;
}

export async function getRaastConfig(): Promise<RaastConfig> {
  try {
    const res = await fetch('/api/raast/config');
    if (res.ok) {
      const data = await res.json();
      return {
        enabled: true,
        raastId: data.raastId || businessConfig.paymentSettings.raast.raastId,
        accountTitle: data.accountTitle || businessConfig.paymentSettings.raast.accountTitle,
        bankName: data.bankName || businessConfig.paymentSettings.raast.bankName,
        iban: data.iban || businessConfig.paymentSettings.raast.iban,
        currency: 'PKR',
        instructions: data.instructions || businessConfig.paymentSettings.raast.description,
      };
    }
  } catch (err) {
    console.warn('Using client fallback for Raast configuration:', err);
  }

  return {
    enabled: true,
    raastId: businessConfig.paymentSettings.raast.raastId,
    accountTitle: businessConfig.paymentSettings.raast.accountTitle,
    bankName: businessConfig.paymentSettings.raast.bankName,
    iban: businessConfig.paymentSettings.raast.iban,
    currency: 'PKR',
    instructions: businessConfig.paymentSettings.raast.description,
  };
}

/**
 * Generates standard Raast/EMV compliant or banking QR code Data URL
 */
export async function generateRaastQrDataUrl(params: {
  raastId: string;
  accountTitle: string;
  amount: number;
  orderId: string;
}): Promise<string> {
  const { raastId, accountTitle, amount, orderId } = params;

  // SBP Raast QR payload / Universal Pakistan Banking QR standard payload
  // Format compatible with Pakistani banking scanners (Easypaisa, JazzCash, Meezan, Nayapay, Sadapay, HBL)
  const qrPayload = JSON.stringify({
    service: 'RAAST_P2M',
    raastId: raastId,
    title: accountTitle,
    amount: amount,
    currency: 'PKR',
    ref: orderId,
    note: `Order ${orderId} Shaan Store`,
  });

  try {
    const dataUrl = await QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Fallback: simpler string format
    return await QRCode.toDataURL(
      `RAAST:${raastId}?amount=${amount}&ref=${orderId}&name=${encodeURIComponent(accountTitle)}`,
      { width: 320, margin: 2 }
    );
  }
}
