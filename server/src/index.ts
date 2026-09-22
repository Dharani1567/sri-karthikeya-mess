import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import companyRoutes from './routes/companies.js';
import mealRoutes from './routes/meals.js';
import supplyRoutes from './routes/supply.js';
import invoiceRoutes from './routes/invoices.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration with production support
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'https://*.vercel.app'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((allowed) => allowed === '*' || origin.includes('vercel.app') || origin === allowed)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive fallback for production API client calls
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Sri Karthikeya Deluxe Mess Meal Supply Management System',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/meal-types', mealRoutes);
app.use('/api/supply-logs', supplyRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mess Management Server running on port ${PORT}`);
});
