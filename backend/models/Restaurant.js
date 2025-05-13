const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  cuisine: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  // Add location coordinates
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      default: [0, 0]
    }
  },
  availableTables: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maxPeoplePerTable: {
    type: Number,
    required: true,
    min: 1,
    default: 4
  },
  bookingTimes: {
    type: [String],
    default: ['18:00', '19:00', '20:00', '21:00']
  },
  photos: {
    type: [String],
    default: []
  },
  reviews: {
    type: [reviewSchema],
    default: []
  },
  approved: {
    type: Boolean,
    default: false
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  openingHours: {
    type: String,
    default: ''
  },
  specialOffers: {
    type: String,
    default: ''
  },
  popularDishes: {
    type: [String],
    default: []
  },
  features: {
    hasParking: { type: Boolean, default: false },
    hasWifi: { type: Boolean, default: false },
    isAccessible: { type: Boolean, default: false },
    allowsPets: { type: Boolean, default: false },
    hasOutdoorSeating: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Fixed virtual for average rating
restaurantSchema.virtual('averageRating').get(function() {
  if (!this.reviews || !Array.isArray(this.reviews) || this.reviews.length === 0) {
    return 0;
  }
  
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / this.reviews.length) * 10) / 10;
});

// Add virtual for Google Maps URL
restaurantSchema.virtual('googleMapsUrl').get(function() {
  // Option 1: If we have coordinates
  if (this.location && this.location.coordinates && 
      this.location.coordinates.length === 2 && 
      this.location.coordinates[0] !== 0 && 
      this.location.coordinates[1] !== 0) {
    const [longitude, latitude] = this.location.coordinates;
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }
  
  // Option 2: If we don't have coordinates, use the address
  const formattedAddress = encodeURIComponent(
    `${this.address}, ${this.city}, ${this.state} ${this.zipCode}`
  );
  return `https://www.google.com/maps?q=${formattedAddress}`;
});

// Create a 2dsphere index for location-based queries
restaurantSchema.index({ location: '2dsphere' });

// Index for search optimization
restaurantSchema.index({ name: 'text', cuisine: 'text', city: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);