const mongoose = require('mongoose');

// Notification schema
const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['booking', 'reminder', 'system', 'review'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Customer', 'RestaurantManager', 'Admin'],
    default: 'Customer',
  },
  // Added fields
  favoriteRestaurants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  notifications: [notificationSchema],
  preferences: {
    cuisine: [String],
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$'
    },
    location: String,
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: Date,
  // Metadata
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Pre-save hook to check if profile is completed
userSchema.pre('save', function(next) {
  // Check if essential fields are filled
  if (this.name && this.email) {
    this.profileCompleted = true;
  } else {
    this.profileCompleted = false;
  }
  next();
});

// Method to add notification
userSchema.methods.addNotification = async function(notificationData) {
  this.notifications.push(notificationData);
  await this.save();
  return this.notifications[this.notifications.length - 1];
};

module.exports = mongoose.model('User', userSchema);