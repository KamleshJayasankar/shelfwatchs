import User from '../models/User.js';
import { signToken } from '../utils/token.js';

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  shopId: user.shopId
});

// Public sign-up always creates a NEW shop and its owner (admin).
// A client-supplied role is ignored, so nobody can self-register into another shop or escalate.
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = new User({ name, email, password, role: 'admin' });
    user.shopId = user._id;
    await user.save();

    const token = signToken(user);
    res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

// Admin-only: add a staff member to the admin's own shop.
export const createStaff = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const staff = await User.create({ name, email, password, role: 'staff', shopId: req.user.shopId });
    res.status(201).json({ user: serializeUser(staff) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};
