const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Initializes Socket.io on top of the existing HTTP server.
 * Every socket connection must present a valid JWT (same token used for REST APIs)
 * so we never broadcast sensitive data to unauthenticated clients.
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication token missing'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user ${socket.user.id}, role ${socket.user.role})`);

    // Put admins in a dedicated room so we can target admin-only events later if needed
    if (socket.user.role === 'admin') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocket;
