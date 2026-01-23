import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes';
import superAdminRoutes from './routes/superAdmin.routes';
import memberRoutes from './routes/member.routes';
import disciplineRoutes from './routes/discipline.routes';
import attendanceRoutes from './routes/attendance.routes';
import pricingRoutes from './routes/pricing.routes';
import membershipRoutes from './routes/membership.routes';
import gymRoutes from './routes/gym.routes';

// Middlewares
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GymApp API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/disciplines', disciplineRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/gyms', gymRoutes);

// Error handling middleware (debe ser el último)
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`👑 Super Admin: http://localhost:${PORT}/api/super-admin`);
  console.log(`👥 Members: http://localhost:${PORT}/api/members`);
  console.log(`🏋️  Disciplines: http://localhost:${PORT}/api/disciplines`);
  console.log(`📋 Attendances: http://localhost:${PORT}/api/attendances`);
  console.log(`💰 Pricing: http://localhost:${PORT}/api/pricing`);
  console.log(`🎫 Memberships: http://localhost:${PORT}/api/memberships`);
  console.log(`🏢 Gyms: http://localhost:${PORT}/api/gyms`);
});

export default app;
