# ShelfWatch

ShelfWatch AI is a full-stack inventory and expiry-tracking app for small retail shops. Owners photograph a pack and Gemini reads the product name, category and expiry date; an AI action plan then tells them what to discount, bundle, move or return before stock is wasted.

## AI features (Google Gemini)

- **Scan with AI** (`POST /api/ai/scan`): multimodal Gemini reads a photo of a pack and returns structured JSON (name, category, expiry date, MRP, confidence) that pre-fills the product form.
- **AI action plan** (`GET /api/ai/insights`): Gemini turns expired and near-expiry stock into per-product actions (discount %, bundle, move to front, return, remove).
- **Value at risk**: dashboard total of stock value that is expired or expires within 7 days.

## Tech stack

- Backend: Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs, Nodemailer, node-cron, multer
- AI: Google Gemini API via `@google/genai` (key from Google AI Studio)
- Frontend: React, Vite, Tailwind CSS, Axios, react-router-dom, react-hot-toast

## Backend setup

1. Install backend dependencies:

   ```bash
   npm install
   ```

2. Create a backend `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

3. Fill in:

   ```bash
   MONGO_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-long-random-secret
   CLIENT_URL=http://localhost:5173
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_APP_PASSWORD=your-gmail-app-password
   OWNER_EMAIL=shop-owner@example.com
   GEMINI_API_KEY=your-google-ai-studio-api-key
   GEMINI_MODEL=gemini-2.5-flash
   ```

4. Run the API:

   ```bash
   npm run dev
   ```

   The backend runs on `http://localhost:8080`.

## Frontend setup

1. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Create frontend env:

   ```bash
   cp .env.example .env
   ```

3. Run the frontend:

   ```bash
   npm run dev
   ```

   The frontend runs on `http://localhost:5173`.

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products?category=Biscuits&status=7-day&search=parle&sort=asc`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id` admin only
- `GET /api/products/stats`
- `POST /api/auth/staff` admin only, adds a staff user to the admin's shop
- `POST /api/ai/scan` multipart field `image`
- `GET /api/ai/insights`

Every product and user belongs to a shop (`shopId`); public registration creates a new shop and its admin.

## Deployment

### Render backend

This repo includes `render.yaml`. Configure these Render environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_APP_PASSWORD`
- `OWNER_EMAIL`
- `CLIENT_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional)

### Vercel frontend

Set the frontend root to `frontend` and configure:

```bash
VITE_API_URL=https://your-render-api.onrender.com/api
```

## Expiry alerts

The backend starts a daily cron job at 8:00 AM server time. It finds expired products and products expiring within 7 days, emails a summary to each shop's admin (`OWNER_EMAIL` is a fallback), and logs each product/alert type once in `AlertLog`.
