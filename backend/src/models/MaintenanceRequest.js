const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [1000, 'Issue description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

maintenanceRequestSchema.index({ status: 1 });
maintenanceRequestSchema.index({ tenant: 1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
