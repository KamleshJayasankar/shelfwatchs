import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startExpiryCron } from './jobs/expiryCron.js';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`ShelfWatch API running on port ${PORT}`);
    });
    startExpiryCron();
  } catch (error) {
    console.error('Failed to start ShelfWatch API:', error.message);
    process.exit(1);
  }
};

startServer();
