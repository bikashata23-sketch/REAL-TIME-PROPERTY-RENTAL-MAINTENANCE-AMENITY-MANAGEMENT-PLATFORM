const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    amenity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Amenity',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String, // stored as 'HH:mm' 24-hour format for simple comparison
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Completed'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

// Speeds up conflict-detection queries (amenity + date range scans)
bookingSchema.index({ amenity: 1, date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
