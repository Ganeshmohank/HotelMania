// Updated Booking.js model
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  partySize: {
    type: Number,
    required: true,
    min: 1
  },
  requiredTables: {
    type: Number,
    default: 1
  },
  specialRequests: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  confirmationCode: {
    type: String,
    unique: true,
    sparse: true // Allow nulls and enforce uniqueness only on non-null values
  },
  contactPhone: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    default: ''
  },
  tableNumber: {
    type: String,
    default: ''
  },
  // For tracking updates and communications
  statusHistory: [{
    status: String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String
  }],
  notificationsSent: [{
    type: { type: String, enum: ['confirmation', 'reminder', 'update', 'cancellation'] },
    sentAt: { type: Date, default: Date.now },
    success: Boolean,
    method: { type: String, enum: ['email', 'sms', 'push'] }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate confirmation code before saving
bookingSchema.pre('save', async function(next) {
  if (!this.confirmationCode && this.status === 'approved') {
    // Generate a unique confirmation code
    this.confirmationCode = generateConfirmationCode();
  }
  
  // Add to status history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date(),
      updatedBy: this.updatedBy || this.user, // Default to the booking user
      note: ''
    });
  }
  
  next();
});

// Helper function to generate a random confirmation code
function generateConfirmationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY23456789'; // Avoiding confusing characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Indexes
bookingSchema.index({ restaurant: 1, date: 1 });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ confirmationCode: 1 });

module.exports = mongoose.model('Booking', bookingSchema);