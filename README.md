# ShelfWatch

ShelfWatch is a full-stack inventory and expiry-tracking app for a small retail shop selling biscuits, chocolates, chips, and other packaged goods.

## Tech stack

- Backend: Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs, Nodemailer, node-cron
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

## Deployment

### Render backend

This repo includes `render.yaml`. Configure these Render environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_APP_PASSWORD`
- `OWNER_EMAIL`
- `CLIENT_URL`

### Vercel frontend

Set the frontend root to `frontend` and configure:

```bash
VITE_API_URL=https://your-render-api.onrender.com/api
```

## Expiry alerts

The backend starts a daily cron job at 8:00 AM server time. It finds expired products and products expiring within 7 days, emails a summary to `OWNER_EMAIL`, and writes entries to `AlertLog`.
