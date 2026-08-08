const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Amenity name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Amenity', amenitySchema);
