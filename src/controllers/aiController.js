import Product from '../models/Product.js';
import { generateActionPlan, scanProductImage } from '../services/geminiService.js';
import { addDays, startOfToday } from '../utils/dateRanges.js';

// Turns a raw Gemini/SDK failure into a clear status code and a friendly message.
const handleGeminiError = (error, label, fallbackMessage) => {
  if (error.statusCode) return error;

  console.error(`${label}:`, error.message);

  const text = String(error.message);
  if (/429|RESOURCE_EXHAUSTED/.test(text)) {
    error.statusCode = 429;
    error.message = 'AI limit reached. Please wait a minute and try again.';
  } else if (/504|DEADLINE|timed out|timeout/i.test(text)) {
    error.statusCode = 504;
    error.message = 'Gemini is busy right now. Please try again in a moment.';
  } else {
    error.statusCode = 502;
    error.message = fallbackMessage;
  }

  return error;
};

export const scanProduct = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Attach a product photo in the "image" field' });
    }

    const result = await scanProductImage({ buffer: req.file.buffer, mimeType: req.file.mimetype });
    res.json(result);
  } catch (error) {
    next(
      handleGeminiError(
        error,
        'Gemini scan failed',
        'Could not read the photo. Try a clearer, well-lit picture of the date.'
      )
    );
  }
};

export const getInsights = async (req, res, next) => {
  try {
    const today = startOfToday();
    const products = await Product.find({ shopId: req.user.shopId, expiryDate: { $lte: addDays(today, 14) } })
      .sort({ expiryDate: 1 })
      .limit(40);

    if (products.length === 0) {
      return res.json({ summary: 'Nothing is expired or expiring in the next 14 days.', actions: [] });
    }

    const items = products.map((product) => ({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      daysLeft: Math.round((product.expiryDate - today) / 86400000)
    }));

    res.json(await generateActionPlan(items));
  } catch (error) {
    next(handleGeminiError(error, 'Gemini insights failed', 'Could not generate the action plan right now.'));
  }
};