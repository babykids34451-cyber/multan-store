import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const apiRouter = express.Router();

// Ensure res.status, res.json, and res.send are available when used as Connect middleware in Vite
apiRouter.use((_req: Request, res: Response, next) => {
  const resAny = res as any;
  if (typeof resAny.status !== 'function') {
    resAny.status = function (statusCode: number) {
      this.statusCode = statusCode;
      return this;
    };
  }
  if (typeof resAny.json !== 'function') {
    resAny.json = function (data: unknown) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
      return this;
    };
  }
  if (typeof resAny.send !== 'function') {
    resAny.send = function (data: unknown) {
      if (typeof data === 'object' && data !== null) {
        return this.json(data);
      }
      this.end(data);
      return this;
    };
  }
  next();
});

apiRouter.use(express.json());
apiRouter.use(express.urlencoded({ extended: true }));

// SBP Raast & QR Code payment configuration endpoint
apiRouter.get('/raast/config', (_req: Request, res: Response) => {
  const raastId = process.env.RAAST_ID || '03124352369';
  const accountTitle = process.env.RAAST_ACCOUNT_TITLE || 'Muhammad Muzamil';
  const rawBankName = process.env.RAAST_BANK_NAME;
  let bankName = 'JS Bank / ZINDIGI';
  if (rawBankName) {
    if (rawBankName.toUpperCase() === 'ZINDIGI' || rawBankName.toUpperCase() === 'JS BANK / ZINDIGI') {
      bankName = 'JS Bank / ZINDIGI';
    } else if (rawBankName.toLowerCase().includes('js bank')) {
      bankName = rawBankName;
    } else {
      bankName = `JS Bank / ${rawBankName}`;
    }
  }
  const iban = process.env.RAAST_IBAN || 'PK70JSBL9999903124352369';

  res.json({
    enabled: true,
    raastId,
    accountTitle,
    bankName,
    iban,
    currency: 'PKR',
    instructions:
      'Transfer exact order amount using any Pakistani banking app (EasyPaisa, JazzCash, Nayapay, Sadapay, Meezan, HBL, UBL, etc.) via Raast ID or Bank QR, then submit your Transaction ID (TRX ID).',
  });
});

// Verify & record customer transaction ID / proof reference
apiRouter.post('/raast/verify-trx', (req: Request, res: Response) => {
  const { orderId, transactionId, customerPhone, amount } = req.body;

  if (!transactionId || typeof transactionId !== 'string' || transactionId.trim().length < 4) {
    return res.status(400).json({
      valid: false,
      message: 'Please provide a valid 6 to 12 digit Transaction ID (TRX ID) from your banking receipt.',
    });
  }

  // Clean and sanitize TRX ID
  const cleanTrx = transactionId.trim().toUpperCase();

  return res.json({
    valid: true,
    transactionId: cleanTrx,
    orderId,
    amount,
    customerPhone,
    status: 'received',
    message: 'Transaction reference recorded. Our billing team will verify it with your bank statement.',
  });
});

// Legacy backward-compatibility endpoint (in case of cached client requests)
apiRouter.get('/jazzcash/status', (_req: Request, res: Response) => {
  res.json({
    configured: false,
    mode: 'deprecated',
    message: 'Standard SBP Raast ID and QR Code payment is now active on Shaan Online Store.',
  });
});

// ZIP Package Download & Status Endpoints
apiRouter.get('/downloads/list', (_req: Request, res: Response) => {
  const downloadsDir = path.resolve(process.cwd(), 'public', 'downloads');
  const packages = [
    {
      id: 'website',
      name: 'Shaan Online Store - Customer Website',
      filename: 'shaan-storefront-website.zip',
      description: 'Front-end customer storefront (Home, Catalog, Cart, Checkout, WhatsApp Order, Tracking)',
      downloadUrl: '/downloads/shaan-storefront-website.zip',
      directApiUrl: '/api/download/website',
      exists: fs.existsSync(path.join(downloadsDir, 'shaan-storefront-website.zip')),
      sizeBytes: fs.existsSync(path.join(downloadsDir, 'shaan-storefront-website.zip'))
        ? fs.statSync(path.join(downloadsDir, 'shaan-storefront-website.zip')).size
        : 0,
    },
    {
      id: 'admin',
      name: 'Shaan Online Store - Admin & Management Portal',
      filename: 'shaan-admin-portal.zip',
      description: 'Dedicated back-office portal (Product & Stock manager, Order status dispatch, Raast setup, Settings)',
      downloadUrl: '/downloads/shaan-admin-portal.zip',
      directApiUrl: '/api/download/admin',
      exists: fs.existsSync(path.join(downloadsDir, 'shaan-admin-portal.zip')),
      sizeBytes: fs.existsSync(path.join(downloadsDir, 'shaan-admin-portal.zip'))
        ? fs.statSync(path.join(downloadsDir, 'shaan-admin-portal.zip')).size
        : 0,
    },
    {
      id: 'full',
      name: 'Shaan Online Store - Full Combined Project',
      filename: 'shaan-store-full-project.zip',
      description: 'All-in-one complete source code bundle',
      downloadUrl: '/downloads/shaan-store-full-project.zip',
      directApiUrl: '/api/download/full',
      exists: fs.existsSync(path.join(downloadsDir, 'shaan-store-full-project.zip')),
      sizeBytes: fs.existsSync(path.join(downloadsDir, 'shaan-store-full-project.zip'))
        ? fs.statSync(path.join(downloadsDir, 'shaan-store-full-project.zip')).size
        : 0,
    },
  ];

  res.json({
    success: true,
    packages,
  });
});

apiRouter.get('/download/:type', (req: Request, res: Response) => {
  const { type } = req.params;
  const downloadsDir = path.resolve(process.cwd(), 'public', 'downloads');
  let filename = '';

  if (type === 'website') {
    filename = 'shaan-storefront-website.zip';
  } else if (type === 'admin') {
    filename = 'shaan-admin-portal.zip';
  } else if (type === 'full') {
    filename = 'shaan-store-full-project.zip';
  } else {
    return res.status(404).json({ error: 'Invalid package type requested. Use website, admin, or full.' });
  }

  const filePath = path.join(downloadsDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Package ${filename} has not been built yet.` });
  }

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', stat.size);

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});
