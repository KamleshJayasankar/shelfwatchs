// Simple in-memory per-user limiter to protect the Gemini quota (resets on server restart).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_CALLS = Number(process.env.AI_CALLS_PER_HOUR) || 40;
const hits = new Map();

export const aiRateLimit = (req, res, next) => {
  const key = String(req.user._id);
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_CALLS) {
    return res.status(429).json({ message: 'AI request limit reached. Please try again later.' });
  }

  recent.push(now);
  hits.set(key, recent);
  next();
};
