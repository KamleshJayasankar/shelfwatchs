import { GoogleGenAI, Type } from '@google/genai';
import { CATEGORIES } from '../utils/categories.js';

// Check Google AI Studio for the current model ID and override via GEMINI_MODEL if needed.
const MODEL = () => process.env.GEMINI_MODEL || 'gemini-3.5-flash';

let client;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not configured on the server');
    error.statusCode = 503;
    throw error;
  }
  client ||= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 30000 } });
  return client;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const cleanDate = (value) => (typeof value === 'string' && DATE_RE.test(value) && !Number.isNaN(Date.parse(value)) ? value : null);

const SCAN_PROMPT = `You are reading a photo of a packaged retail product (or a shelf label) from a small shop in India.
Extract the following from the PRINTED text on the pack:
- name: product name with brand and variant/weight if visible
- category: one of ${CATEGORIES.join(', ')}
- expiryDate: the expiry date as YYYY-MM-DD. Look for "EXP", "Expiry", "Use by", "Best before". If only month/year is printed (e.g. 08/2027), use the LAST day of that month. If the pack only says "Best before N months from manufacture" and a manufacture date (MFG/Mfd/Packed on) is printed, compute the expiry. Otherwise null.
- manufactureDate: YYYY-MM-DD or null
- mrp: the printed MRP in rupees as a number, or null
- confidence: high, medium or low for the expiry date reading
- notes: one short sentence if anything is unclear (blur, glare, ambiguous format)
Never guess. If a value is not clearly readable, return null for it and lower the confidence.`;

export const scanProductImage = async ({ buffer, mimeType }) => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: MODEL(),
    contents: [
      { inlineData: { mimeType, data: buffer.toString('base64') } },
      { text: SCAN_PROMPT }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, nullable: true },
          category: { type: Type.STRING, enum: CATEGORIES },
          expiryDate: { type: Type.STRING, nullable: true },
          manufactureDate: { type: Type.STRING, nullable: true },
          mrp: { type: Type.NUMBER, nullable: true },
          confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          notes: { type: Type.STRING, nullable: true }
        },
        required: ['category', 'confidence']
      }
    }
  });

  const raw = JSON.parse(response.text);

  return {
    name: typeof raw.name === 'string' ? raw.name.trim() : null,
    category: CATEGORIES.includes(raw.category) ? raw.category : 'Other',
    expiryDate: cleanDate(raw.expiryDate),
    manufactureDate: cleanDate(raw.manufactureDate),
    mrp: typeof raw.mrp === 'number' && raw.mrp >= 0 ? raw.mrp : null,
    confidence: ['high', 'medium', 'low'].includes(raw.confidence) ? raw.confidence : 'low',
    notes: typeof raw.notes === 'string' ? raw.notes : null
  };
};

const ACTIONS = ['discount', 'bundle', 'move_to_front', 'return_to_supplier', 'remove'];

export const generateActionPlan = async (items) => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: MODEL(),
    contents: `You are an inventory advisor for a small Indian retail shop. These products are expired or close to expiry.
Each has daysLeft (negative means already expired), quantity, unitPrice (INR) and category.
For each product choose ONE action: ${ACTIONS.join(', ')}.
Rules: expired items must be "remove" (or "return_to_supplier" if the category usually allows returns, e.g. Dairy, Beverages). Items with 1-7 days left usually get "discount" with a sensible discountPercent (10-50) or "bundle" with a fast-moving item. 8-14 days: "move_to_front" or a small discount.
Keep each reason under 20 words. Also give a 2-sentence summary of the most urgent priorities.
Products: ${JSON.stringify(items)}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          actions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                action: { type: Type.STRING, enum: ACTIONS },
                discountPercent: { type: Type.NUMBER, nullable: true },
                reason: { type: Type.STRING }
              },
              required: ['name', 'action', 'reason']
            }
          }
        },
        required: ['summary', 'actions']
      }
    }
  });

  const raw = JSON.parse(response.text);
  return {
    summary: String(raw.summary || ''),
    actions: Array.isArray(raw.actions) ? raw.actions.filter((a) => ACTIONS.includes(a.action)) : []
  };
};
