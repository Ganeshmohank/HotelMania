// Modified profileController.js
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/sendEmail');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update name if provided
    if (name) {
      user.name = name;
    }
    
    // Update password if provided
    if (newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      // Send password change notification
      const passwordChangeEmail = {
        subject: 'Password Changed',
        html: `
          <h2>Password Changed</h2>
          <p>Your password was successfully changed.</p>
          <p>If you did not make this change, please contact support immediately.</p>
        `
      };
      
      await sendEmail(user.email, passwordChangeEmail.subject, passwordChangeEmail.html);
    }
    
    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(req.user.userId).select('-password');
    
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    // Find all restaurants that have reviews by the user
    const restaurants = await Restaurant.find({
      'reviews.user': req.user.userId
    });
    
    // Extract and format user's reviews
    const myReviews = [];
    
    restaurants.forEach(restaurant => {
      restaurant.reviews.forEach(review => {
        if (review.user.toString() === req.user.userId) {
          myReviews.push({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            restaurant: {
              _id: restaurant._id,
              name: restaurant.name,
              cuisine: restaurant.cuisine,
              city: restaurant.city
            }
          });
        }
      });
    });
    
    // Sort reviews by date, newest first
    myReviews.sort((a, b) => b.createdAt - a.createdAt);
    
    res.json(myReviews);
  } catch (err) {
    console.error('Get user reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add favorite restaurant
exports.addFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Add to Favorites collection or update User model (depends on implementation)
    // Below is a simple implementation that adds favoriteRestaurants array to User model
    
    const user = await User.findById(req.user.userId);
    
    // Check if already a favorite
    if (user.favoriteRestaurants && user.favoriteRestaurants.includes(restaurantId)) {
      return res.status(400).json({ message: 'Restaurant already in favorites' });
    }
    
    // Initialize array if it doesn't exist
    if (!user.favoriteRestaurants) {
      user.favoriteRestaurants = [];
    }
    
    // Add restaurant to favorites
    user.favoriteRestaurants.push(restaurantId);
    await user.save();
    
    res.json({ message: 'Added to favorites' });
  } catch (err) {
    console.error('Add favorite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove favorite restaurant
exports.removeFavorite = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    
    const user = await User.findById(req.user.userId);
    
    // Check if user has favorites array
    if (!user.favoriteRestaurants) {
      return res.status(400).json({ message: 'No favorites found' });
    }
    
    // Check if restaurant is in favorites
    const index = user.favoriteRestaurants.indexOf(restaurantId);
    
    if (index === -1) {
      return res.status(400).json({ message: 'Restaurant not in favorites' });
    }
    
    // Remove restaurant from favorites
    user.favoriteRestaurants.splice(index, 1);
    await user.save();
    
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get favorite restaurants
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Check if user has favorites
    if (!user.favoriteRestaurants || user.favoriteRestaurants.length === 0) {
      return res.json([]);
    }
    
    // Get all favorite restaurants
    const favorites = await Restaurant.find({
      _id: { $in: user.favoriteRestaurants }
    }).select('name cuisine city state zipCode cost photos reviews availableTables maxPeoplePerTable bookingTimes');
    
    // Calculate average rating for each restaurant
    const favoritesWithRatings = favorites.map(restaurant => {
      const rest = restaurant.toObject();
      const reviews = rest.reviews || [];
      
      rest.reviewCount = reviews.length;
      rest.avgRating = reviews.length 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : null;
      
      return rest;
    });
    
    res.json(favoritesWithRatings);
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get booking history (all bookings, including past ones)
exports.getBookingHistory = async (req, res) => {
  try {
    // Get all bookings (both active and past)
    const bookings = await Booking.find({
      user: req.user.userId
    })
    .populate('restaurant', 'name city cuisine maxPeoplePerTable')
    .sort({ date: -1 }); // Sort by date in descending order
    
    res.json(bookings);
  } catch (err) {
    console.error('Get booking history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's active bookings (current and future bookings)
exports.getMyBookings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Find active bookings (today or in the future)
    const activeBookings = await Booking.find({
      user: req.user.userId,
      // date: { $gte: today },
      status: { $in: ['pending','approved'] } // Include both pending and approved
    })
    .populate('restaurant', 'name city cuisine photos maxPeoplePerTable')
    .sort({ date: 1 }); // Sort by date in ascending order
    
    res.json(activeBookings);
  } catch (err) {
    console.error('Get active bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports;