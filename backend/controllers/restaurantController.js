// restaurantController.js
const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const User = require('../models/User'); // Add User model to get customer details if needed
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');
const { createNotification } = require('../utils/notificationUtil');

/**
 * Add a new restaurant
 */
// exports.addRestaurant = async (req, res) => {
//   try {
//     // Parse arrays from request
//     let bookingTimesArray = [];
//     let photosArray = [];
    
//     if (req.body.bookingTimes) {
//       bookingTimesArray = Array.isArray(req.body.bookingTimes)
//         ? req.body.bookingTimes
//         : req.body.bookingTimes.split(',').map(t => t.trim()).filter(Boolean);
//     }
    
//     if (req.body.photos) {
//       photosArray = Array.isArray(req.body.photos)
//         ? req.body.photos
//         : req.body.photos.split(',').map(u => u.trim()).filter(Boolean);
//     }
    
//     // Create restaurant with manager reference
//     const newRestaurant = await Restaurant.create({
//       ...req.body,
//       bookingTimes: bookingTimesArray,
//       photos: photosArray,
//       manager: req.user.userId
//     });
    
//     // Create notification for the manager
//     // try {
//     //   await createNotification(
//     //     req.user.userId,
//     //     'restaurant', // Use allowed enum value
//     //     'Restaurant Created',
//     //     `Your restaurant "${newRestaurant.name}" has been successfully created.`,
//     //     { restaurantId: newRestaurant._id }
//     //   );
//     // } catch (notifError) {
//     //   console.error('Error creating restaurant notification:', notifError);
//     // }
    
//     res.status(201).json(newRestaurant);
//   } catch (err) {
//     console.error('Error adding restaurant:', err);
//     res.status(500).json({ 
//       message: 'Could not add restaurant', 
//       error: err.message 
//     });
//   }
// };

// /**
//  * Update an existing restaurant
//  */
// exports.updateRestaurant = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Verify ownership
//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }
    
//     if (restaurant.manager.toString() !== req.user.userId) {
//       return res.status(403).json({ message: 'Unauthorized: You do not own this restaurant' });
//     }
    
//     // Parse arrays from request
//     let bookingTimesArray = [];
//     let photosArray = [];
    
//     if (req.body.bookingTimes) {
//       bookingTimesArray = Array.isArray(req.body.bookingTimes)
//         ? req.body.bookingTimes
//         : req.body.bookingTimes.split(',').map(t => t.trim()).filter(Boolean);
//     }
    
//     if (req.body.photos) {
//       photosArray = Array.isArray(req.body.photos)
//         ? req.body.photos
//         : req.body.photos.split(',').map(u => u.trim()).filter(Boolean);
//     }
    
//     // Update the restaurant
//     const updatedRestaurant = await Restaurant.findByIdAndUpdate(
//       id,
//       {
//         ...req.body,
//         bookingTimes: bookingTimesArray.length > 0 ? bookingTimesArray : restaurant.bookingTimes,
//         photos: photosArray.length > 0 ? photosArray : restaurant.photos
//       },
//       { new: true }
//     );
    
//     res.json(updatedRestaurant);
//   } catch (err) {
//     console.error('Error updating restaurant:', err);
//     res.status(500).json({ 
//       message: 'Could not update restaurant', 
//       error: err.message 
//     });
//   }
// };

exports.addRestaurant = async (req, res) => {
  try {
    // Parse arrays from request
    let bookingTimesArray = [];
    let photosArray = [];
    
    if (req.body.bookingTimes) {
      bookingTimesArray = Array.isArray(req.body.bookingTimes)
        ? req.body.bookingTimes
        : req.body.bookingTimes.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    if (req.body.photos) {
      photosArray = Array.isArray(req.body.photos)
        ? req.body.photos
        : req.body.photos.split(',').map(u => u.trim()).filter(Boolean);
    }
    
    // Process location data
    let locationData = {
      type: 'Point',
      coordinates: [0, 0]  // Default coordinates
    };
    
    if (req.body.location && req.body.location.coordinates) {
      locationData = {
        type: 'Point',
        coordinates: [
          parseFloat(req.body.location.coordinates[0]) || 0,
          parseFloat(req.body.location.coordinates[1]) || 0
        ]
      };
    }
    
    // Create restaurant with manager reference
    const newRestaurant = await Restaurant.create({
      ...req.body,
      bookingTimes: bookingTimesArray,
      photos: photosArray,
      location: locationData,
      manager: req.user.userId
    });
    
    res.status(201).json(newRestaurant);
  } catch (err) {
    console.error('Error adding restaurant:', err);
    res.status(500).json({ 
      message: 'Could not add restaurant', 
      error: err.message 
    });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this restaurant' });
    }
    
    // Parse arrays from request
    let bookingTimesArray = [];
    let photosArray = [];
    
    if (req.body.bookingTimes) {
      bookingTimesArray = Array.isArray(req.body.bookingTimes)
        ? req.body.bookingTimes
        : req.body.bookingTimes.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    if (req.body.photos) {
      photosArray = Array.isArray(req.body.photos)
        ? req.body.photos
        : req.body.photos.split(',').map(u => u.trim()).filter(Boolean);
    }
    
    // Process location data
    let locationData = restaurant.location || {
      type: 'Point',
      coordinates: [0, 0]
    };
    
    if (req.body.location && req.body.location.coordinates) {
      locationData = {
        type: 'Point',
        coordinates: [
          parseFloat(req.body.location.coordinates[0]) || 0,
          parseFloat(req.body.location.coordinates[1]) || 0
        ]
      };
    }
    
    // Update the restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        ...req.body,
        bookingTimes: bookingTimesArray.length > 0 ? bookingTimesArray : restaurant.bookingTimes,
        photos: photosArray.length > 0 ? photosArray : restaurant.photos,
        location: locationData
      },
      { new: true }
    );
    
    res.json(updatedRestaurant);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ 
      message: 'Could not update restaurant', 
      error: err.message 
    });
  }
};

/**
 * Delete a restaurant
 */
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this restaurant' });
    }
    
    // Delete all bookings for this restaurant
    await Booking.deleteMany({ restaurant: id });
    
    // Delete the restaurant
    await Restaurant.findByIdAndDelete(id);
    
    // Create notification for the manager
    // try {
    //   await createNotification(
    //     req.user.userId,
    //     'restaurant', // Use allowed enum value
    //     'Restaurant Deleted',
    //     `Your restaurant "${restaurant.name}" has been deleted along with all associated bookings.`,
    //     {}
    //   );
    // } catch (notifError) {
    //   console.error('Error creating restaurant deletion notification:', notifError);
    // }
    
    res.json({ message: 'Restaurant and all associated bookings deleted successfully' });
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).json({ 
      message: 'Could not delete restaurant', 
      error: err.message 
    });
  }
};

/**
 * Get manager's restaurant listings
 */
exports.getManagerListings = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ manager: req.user.userId });
    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching manager listings:', err);
    res.status(500).json({ 
      message: 'Could not fetch your restaurants', 
      error: err.message 
    });
  }
};

/**
 * Get bookings for a specific restaurant
 */
exports.getRestaurantBookings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this restaurant' });
    }
    
    // Get bookings with user information
    const bookings = await Booking.find({ restaurant: restaurantId })
      .populate('user', 'name email')
      .sort({ date: 1, time: 1 });
    
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ 
      message: 'Could not fetch bookings', 
      error: err.message 
    });
  }
};

/**
 * Get statistics for a specific restaurant
 */
exports.getRestaurantStats = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this restaurant' });
    }
    
    // Get all bookings for this restaurant
    const allBookings = await Booking.find({ restaurant: restaurantId });
    
    // Calculate statistics
    const totalBookings = allBookings.length;
    
    // Calculate revenue (assuming average spend based on restaurant cost)
    const avgSpendPerPerson = restaurant.cost * 25; // Simple estimation
    const revenue = allBookings.reduce((total, booking) => {
      // Only count approved bookings for revenue
      if (booking.status === 'approved' || !booking.status) {
        return total + (booking.partySize || 2) * avgSpendPerPerson;
      }
      return total;
    }, 0);
    
    // Find most popular booking times
    const timeFrequency = {};
    allBookings.forEach(booking => {
      if (booking.time) {
        timeFrequency[booking.time] = (timeFrequency[booking.time] || 0) + 1;
      }
    });
    
    // Sort times by frequency
    const popularTimes = Object.entries(timeFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3); // Top 3 times
    
    // Calculate average party size
    const totalPartySize = allBookings.reduce((sum, booking) => {
      return sum + (booking.partySize || 0);
    }, 0);
    const avgPartySize = totalBookings > 0 ? 
      Math.round((totalPartySize / totalBookings) * 10) / 10 : 0;
    
    // Calculate cancellation rate
    const cancelledBookings = allBookings.filter(
      booking => booking.status === 'cancelled' || booking.status === 'rejected'
    ).length;
    const cancellationRate = totalBookings > 0 ? 
      Math.round((cancelledBookings / totalBookings) * 100) : 0;
    
    res.json({
      totalBookings,
      revenue,
      popularTimes,
      avgPartySize,
      cancellationRate,
      // Additional stats
      pendingBookings: allBookings.filter(b => !b.status || b.status === 'pending').length,
      approvedBookings: allBookings.filter(b => b.status === 'approved').length,
      rejectedBookings: allBookings.filter(b => b.status === 'rejected').length,
      cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length
    });
  } catch (err) {
    console.error('Error getting restaurant statistics:', err);
    res.status(500).json({ 
      message: 'Could not get restaurant statistics', 
      error: err.message 
    });
  }
};

/**
 * Approve a booking
 */
exports.approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate('restaurant')
      .populate('user', 'name email'); // Make sure we have the user's email
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify restaurant ownership
    if (booking.restaurant.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this restaurant' });
    }
    
    booking.status = 'approved';
    await booking.save();
    
    // Get user details for email
    const userName = booking.user?.name || 'Customer';
    const userEmail = booking.user?.email;
    
    if (!userEmail) {
      console.error('User email missing for booking notification');
      return res.status(500).json({ message: 'Could not notify customer - email missing' });
    }
    
    // Send email notification to customer
    const subject = 'Booking Approved - Hotel Mania';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2C7A7B; text-align: center;">Your Booking is Confirmed!</h2>
        <p>Dear ${userName},</p>
        <p>We're pleased to inform you that your booking at <strong>${booking.restaurant.name}</strong> has been approved.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(booking.date).toDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.time}</p>
          <p style="margin: 5px 0;"><strong>Party Size:</strong> ${booking.partySize} people</p>
          <p style="margin: 5px 0;"><strong>Special Requests:</strong> ${booking.specialRequests || 'None'}</p>
        </div>
        <p>We look forward to serving you and your party. If you need to make any changes to your reservation, please contact us as soon as possible.</p>
        <p>Thank you for choosing ${booking.restaurant.name}!</p>
        <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
          <p>This is an automated message from Hotel Mania. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    try {
      await sendEmail(userEmail, subject, html);
      console.log(`Booking confirmation email sent to ${userEmail}`);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Continue with the response even if email fails
    }
    
    // Create push notification for the customer
    try {
      await createNotification(
        booking.user._id,
        'booking', // Use allowed enum value
        'Booking Approved',
        `Great news! Your booking at ${booking.restaurant.name} for ${new Date(booking.date).toDateString()} at ${booking.time} has been confirmed.`,
        { 
          restaurantId: booking.restaurant._id,
          bookingId: booking._id,
          important: true
        }
      );
      console.log(`Booking approval notification created for user ${booking.user._id}`);
    } catch (notifError) {
      console.error('Error creating approval notification:', notifError);
    }
    
    // Create notification for the restaurant manager as well
    // try {
    //   await createNotification(
    //     req.user.userId, 
    //     'booking', // Use allowed enum value
    //     'Booking Approved',
    //     `You have approved a booking for ${userName} at ${booking.restaurant.name} for ${new Date(booking.date).toDateString()} at ${booking.time}.`,
    //     { 
    //       restaurantId: booking.restaurant._id,
    //       bookingId: booking._id 
    //     }
    //   );
    // } catch (notifError) {
    //   console.error('Error creating manager approval notification:', notifError);
    // }
    
    res.json({ message: 'Booking approved', booking });
  } catch (err) {
    console.error('Error approving booking:', err);
    res.status(500).json({ 
      message: 'Could not approve booking', 
      error: err.message 
    });
  }
};

/**
 * Reject a booking
 */
exports.rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate('restaurant')
      .populate('user', 'name email'); // Make sure we have the user's email
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify restaurant ownership
    if (booking.restaurant.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this restaurant' });
    }
    
    booking.status = 'rejected';
    await booking.save();
    
    // Get user details for email
    const userName = booking.user?.name || 'Customer';
    const userEmail = booking.user?.email;
    
    if (!userEmail) {
      console.error('User email missing for booking notification');
      return res.status(500).json({ message: 'Could not notify customer - email missing' });
    }
    
    // Send email notification to customer
    const subject = 'Booking Update - Hotel Mania';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2C7A7B; text-align: center;">Booking Update</h2>
        <p>Dear ${userName},</p>
        <p>We regret to inform you that your booking request at <strong>${booking.restaurant.name}</strong> for <strong>${new Date(booking.date).toDateString()}</strong> at <strong>${booking.time}</strong> could not be accommodated at this time.</p>
        <p>This could be due to several reasons, including:</p>
        <ul>
          <li>The restaurant is fully booked for the requested time</li>
          <li>Unexpected closure or private event</li>
          <li>Capacity limitations</li>
        </ul>
        <p>We apologize for any inconvenience this may cause. Please feel free to make another booking for a different date or time.</p>
        <p>Thank you for your understanding and for choosing Hotel Mania.</p>
        <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
          <p>This is an automated message from Hotel Mania. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    try {
      await sendEmail(userEmail, subject, html);
      console.log(`Booking rejection email sent to ${userEmail}`);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Continue with the response even if email fails
    }
    
    // Create push notification for the customer
    try {
      await createNotification(
        booking.user._id,
        'booking', // Use allowed enum value
        'Booking Could Not Be Accommodated',
        `Unfortunately, your booking request at ${booking.restaurant.name} for ${new Date(booking.date).toDateString()} at ${booking.time} could not be accommodated.`,
        { 
          restaurantId: booking.restaurant._id,
          bookingId: booking._id,
          important: true
        }
      );
      console.log(`Booking rejection notification created for user ${booking.user._id}`);
    } catch (notifError) {
      console.error('Error creating rejection notification:', notifError);
    }
    
    // Create notification for the restaurant manager as well
    // try {
    //   await createNotification(
    //     req.user.userId, 
    //     'booking', // Use allowed enum value
    //     'Booking Rejected',
    //     `You have rejected a booking for ${userName} at ${booking.restaurant.name} for ${new Date(booking.date).toDateString()} at ${booking.time}.`,
    //     { 
    //       restaurantId: booking.restaurant._id,
    //       bookingId: booking._id 
    //     }
    //   );
    // } catch (notifError) {
    //   console.error('Error creating manager rejection notification:', notifError);
    // }
    
    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    console.error('Error rejecting booking:', err);
    res.status(500).json({ 
      message: 'Could not reject booking', 
      error: err.message 
    });
  }
};

/**
 * Export restaurant bookings to CSV
 */
exports.exportBookings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this restaurant' });
    }
    
    // Get all bookings for this restaurant
    const bookings = await Booking.find({ restaurant: restaurantId })
      .populate('user', 'name email')
      .sort({ date: 1, time: 1 });
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings to export' });
    }
    
    // Create CSV content
    const csvHeader = 'Date,Time,Customer,Email,Party Size,Status';
    const csvRows = bookings.map(booking => {
      const date = new Date(booking.date).toLocaleDateString();
      const time = booking.time || 'N/A';
      const customerName = booking.user?.name || 'Unknown';
      const email = booking.user?.email || 'N/A';
      const partySize = booking.partySize || 'N/A';
      const status = booking.status || 'pending';
      
      return `${date},${time},"${customerName}","${email}",${partySize},${status}`;
    });
    
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${restaurant.name}_bookings.csv"`);
    
    // Send CSV as response
    res.send(csvContent);
  } catch (err) {
    console.error('Error exporting bookings:', err);
    res.status(500).json({ 
      message: 'Could not export bookings', 
      error: err.message 
    });
  }
};

module.exports = exports;