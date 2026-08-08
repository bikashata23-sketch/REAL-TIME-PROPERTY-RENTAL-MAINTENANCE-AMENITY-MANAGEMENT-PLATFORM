/**
 * Run with: node src/utils/seed.js
 * Creates one admin user (if not already present) and sample amenities.
 */
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Amenity = require('../models/Amenity');

const seed = async () => {
  await connectDB();

  const adminEmail = 'admin@propertyplatform.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`✅ Admin created -> email: ${adminEmail} | password: Admin@123`);
  } else {
    console.log('ℹ️  Admin already exists, skipping.');
  }

  const ownerEmail = 'owner@propertyplatform.com';
  const existingOwner = await User.findOne({ email: ownerEmail });

  if (!existingOwner) {
    await User.create({
      name: 'Property Owner',
      email: ownerEmail,
      password: 'Owner@123',
      role: 'owner',
    });
    console.log(`✅ Owner created -> email: ${ownerEmail} | password: Owner@123`);
  } else {
    console.log('ℹ️  Owner already exists, skipping.');
  }

  const amenityNames = ['Gym', 'Swimming Pool', 'Club House', 'Parking', 'Conference Room'];
  for (const name of amenityNames) {
    const exists = await Amenity.findOne({ name });
    if (!exists) {
      await Amenity.create({ name, description: `${name} facility`, available: true });
      console.log(`✅ Amenity created: ${name}`);
    }
  }

  console.log('🌱 Seeding complete');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
