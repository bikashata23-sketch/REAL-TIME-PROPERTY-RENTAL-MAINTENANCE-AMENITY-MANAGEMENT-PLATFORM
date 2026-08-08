const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const initSocket = require('./socket');

const PORT = process.env.PORT || 5000;

// Connect to DB, then start server — never start listening before DB is ready
connectDB().then(() => {
  const httpServer = http.createServer(app);

  // Attach Socket.io to the same HTTP server and expose it to controllers
  // via app.get('io') so REST endpoints can emit real-time events.
  const io = initSocket(httpServer);
  app.set('io', io);

  const server = httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections gracefully instead of silent crash
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
