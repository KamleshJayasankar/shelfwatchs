import Product from '../models/Product.js';
import { addDays, startOfToday } from '../utils/dateRanges.js';

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

export const getProducts = async (req, res, next) => {
  try {
    const { category, status, search, sort = 'asc' } = req.query;
    const filter = {
      ...getStatusFilter(status)
    };

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

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
      ...req.body,
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('addedBy', 'name email role');

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
    const product = await Product.findByIdAndDelete(req.params.id);

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

    const [expired, expiring7Days, expiring30Days, fresh] = await Promise.all([
      Product.countDocuments({ expiryDate: { $lt: today } }),
      Product.countDocuments({ expiryDate: { $gte: today, $lte: in7Days } }),
      Product.countDocuments({ expiryDate: { $gt: in7Days, $lte: in30Days } }),
      Product.countDocuments({ expiryDate: { $gt: in30Days } })
    ]);

    res.json({
      expired,
      expiring7Days,
      expiring30Days,
      fresh
    });
  } catch (error) {
    next(error);
  }
};
