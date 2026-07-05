import cron from 'node-cron';
import AlertLog from '../models/AlertLog.js';
import Product from '../models/Product.js';
import { sendExpirySummaryEmail } from '../services/emailService.js';
import { addDays, startOfToday } from '../utils/dateRanges.js';

export const runExpiryScan = async () => {
  const today = startOfToday();
  const in7Days = addDays(today, 7);

  const [expiredProducts, expiringProducts] = await Promise.all([
    Product.find({ expiryDate: { $lt: today } }).sort({ expiryDate: 1 }),
    Product.find({ expiryDate: { $gte: today, $lte: in7Days } }).sort({ expiryDate: 1 })
  ]);

  await sendExpirySummaryEmail({ expiredProducts, expiringProducts });

  const logs = [
    ...expiredProducts.map((product) => ({ productId: product._id, alertType: 'expired' })),
    ...expiringProducts.map((product) => ({ productId: product._id, alertType: '7-day' }))
  ];

  if (logs.length > 0) {
    await AlertLog.insertMany(logs);
  }
};

export const startExpiryCron = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      await runExpiryScan();
      console.log('Daily expiry scan completed');
    } catch (error) {
      console.error('Daily expiry scan failed:', error.message);
    }
  });
};
