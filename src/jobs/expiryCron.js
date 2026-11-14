import cron from 'node-cron';
import AlertLog from '../models/AlertLog.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendExpirySummaryEmail } from '../services/emailService.js';
import { addDays, startOfToday } from '../utils/dateRanges.js';

const groupByShop = (products) => {
  const groups = new Map();
  for (const product of products) {
    const key = String(product.shopId);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }
  return groups;
};

// Log each (product, alertType) pair only once, so AlertLog does not grow with duplicates every day.
const logNewAlerts = async (products, alertType) => {
  if (products.length === 0) return;

  const existing = await AlertLog.find({ alertType, productId: { $in: products.map((p) => p._id) } }).select('productId');
  const alreadyLogged = new Set(existing.map((log) => String(log.productId)));
  const fresh = products.filter((product) => !alreadyLogged.has(String(product._id)));

  if (fresh.length > 0) {
    await AlertLog.insertMany(fresh.map((product) => ({ productId: product._id, alertType })));
  }
};

export const runExpiryScan = async () => {
  const today = startOfToday();
  const in7Days = addDays(today, 7);

  const products = await Product.find({ expiryDate: { $lte: in7Days } }).sort({ expiryDate: 1 });

  for (const [shopId, shopProducts] of groupByShop(products)) {
    const expiredProducts = shopProducts.filter((product) => product.expiryDate < today);
    const expiringProducts = shopProducts.filter((product) => product.expiryDate >= today);

    // Each shop's alerts go to that shop's admin(s); OWNER_EMAIL is only a fallback.
    const admins = await User.find({ shopId, role: 'admin' }).select('email');
    const recipients = admins.map((admin) => admin.email).join(',') || process.env.OWNER_EMAIL;

    await sendExpirySummaryEmail({ to: recipients, expiredProducts, expiringProducts });
    await logNewAlerts(expiredProducts, 'expired');
    await logNewAlerts(expiringProducts, '7-day');
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
