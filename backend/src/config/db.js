const mongoose = require('mongoose');
const dns = require('dns');

// Some Windows/network setups fail to resolve MongoDB Atlas's SRV DNS
// records via Node's default resolver (querySrv ECONNREFUSED), even though
// the OS itself can resolve them fine. Forcing Node to use public DNS
// servers directly avoids that class of failure without requiring any
// network/router changes on the developer's machine.
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

/**
 * Establishes connection to MongoDB Atlas using Mongoose.
 * Exits process on failure — a running server with no DB
 * connection is worse than a crashed server (fail fast principle).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
