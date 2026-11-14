import Product from '../models/Product.js';
import { addDays, startOfToday } from '../utils/dateRanges.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getStatusFilter = (status) => {
  const today = startOfToday();
  const in7Days = addDays(today, 7);
  const in30Days = addDays(today, 30);

  switch (status) {
    case 'expired':
      return { expiryDate: { $lt: today } };
    case '7-day':
    case 'expiring7':
      return { expiryDate: { $gte: today, $lte: in7Days } };
    case '30-day':
    case 'expiring30':
      return { expiryDate: { $gt: in7Days, $lte: in30Days } };
    case 'fresh':
      return { expiryDate: { $gt: in30Days } };
    default:
      return {};
  }
};

// Never let a client set ownership fields.
const sanitizeBody = ({ shopId, addedBy, _id, ...data }) => data;

export const getProducts = async (req, res, next) => {
  try {
    const { category, status, search, sort = 'asc' } = req.query;
    const filter = {
      shopId: req.user.shopId,
      ...getStatusFilter(status)
    };

    if (category) filter.category = String(category);
    if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };

    const products = await Product.find(filter)
      .populate('addedBy', 'name email role')
      .sort({ expiryDate: sort === 'desc' ? -1 : 1 });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...sanitizeBody(req.body),
      shopId: req.user.shopId,
      addedBy: req.user._id
    });

    const populatedProduct = await product.populate('addedBy', 'name email role');
    res.status(201).json(populatedProduct);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      sanitizeBody(req.body),
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email role');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, shopId: req.user.shopId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

export const getProductStats = async (req, res, next) => {
  try {
    const today = startOfToday();
    const in7Days = addDays(today, 7);
    const in30Days = addDays(today, 30);
    const shopId = req.user.shopId;

    const [expired, expiring7Days, expiring30Days, fresh, atRisk] = await Promise.all([
      Product.countDocuments({ shopId, expiryDate: { $lt: today } }),
      Product.countDocuments({ shopId, expiryDate: { $gte: today, $lte: in7Days } }),
      Product.countDocuments({ shopId, expiryDate: { $gt: in7Days, $lte: in30Days } }),
      Product.countDocuments({ shopId, expiryDate: { $gt: in30Days } }),
      Product.find({ shopId, expiryDate: { $lte: in7Days } }).select('quantity unitPrice expiryDate')
    ]);

    // Stock value (qty x unit price) that is already expired or will expire within 7 days.
    const expiredValue = atRisk
      .filter((item) => item.expiryDate < today)
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const expiring7DaysValue = atRisk
      .filter((item) => item.expiryDate >= today)
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    res.json({
      expired,
      expiring7Days,
      expiring30Days,
      fresh,
      expiredValue,
      expiring7DaysValue,
      valueAtRisk: expiredValue + expiring7DaysValue
    });
  } catch (error) {
    next(error);
  }
};
