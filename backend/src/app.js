const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ---------- Security Middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Only allow our frontend, not '*'
    credentials: true,
  })
);
app.use(mongoSanitize()); // Strip $ and . operators from user input

// ---------- Rate Limiting ----------
// 100 requests per 15 min per IP — generous now, tightened later for auth routes specifically
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ---------- Body Parsing ----------
app.use(express.json({ limit: '10kb' })); // Limit payload size — prevents large-body DoS

// ---------- Logging ----------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ---------- Health Check Route ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ---------- Routes ----------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/amenities', require('./routes/amenityRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// ---------- Error Handling (must be last) ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
