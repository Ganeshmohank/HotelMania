const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Get all restaurants
 */
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ message: 'Failed to fetch restaurants' });
  }
};

/**
 * Get pending restaurants awaiting approval
 */
exports.getPendingRestaurants = async (req, res) => {
  try {
    const pending = await Restaurant.find({ approved: false }).sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    console.error('Error fetching pending restaurants:', err);
    res.status(500).json({ message: 'Failed to fetch pending restaurants' });
  }
};

/**
 * Approve a restaurant
 */
exports.approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(
      id, 
      { approved: true }, 
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    res.json({ message: 'Restaurant approved', restaurant });
  } catch (err) {
    console.error('Error approving restaurant:', err);
    res.status(500).json({ message: 'Failed to approve restaurant' });
  }
};

/**
 * Remove a restaurant
 */
exports.removeRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Remove all bookings associated with this restaurant
    await Booking.deleteMany({ restaurant: id });
    
    // Delete the restaurant
    await Restaurant.findByIdAndDelete(id);
    
    res.json({ 
      message: 'Restaurant and associated bookings deleted successfully',
      restaurantId: id
    });
  } catch (err) {
    console.error('Error removing restaurant:', err);
    res.status(500).json({ message: 'Failed to remove restaurant' });
  }
};

/**
 * Get analytics data with flexible date range
 */
exports.getAnalytics = async (req, res) => {
  try {
    // Get the date range from query params
    const { range = 'month' } = req.query;
    
    // Calculate the start date based on the range
    const startDate = new Date();
    switch (range) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1); // Default to month
    }

    // Get all bookings within the date range
    const bookings = await Booking.find({ 
      createdAt: { $gte: startDate } 
    })
    .populate('restaurant', 'name city state zipCode cuisine availableTables maxPeoplePerTable')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

    // Calculate summary stats
    const activeBookings = bookings.filter(b => b.status === 'Booked').length;
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
    
    // Calculate total tables booked
    const totalTablesBooked = bookings.reduce((sum, booking) => {
      return sum + (booking.requiredTables || 1);
    }, 0);

    // Group bookings by restaurant
    const bookingsByRestaurant = {};
    bookings.forEach(booking => {
      const restaurantId = booking.restaurant?._id.toString();
      if (!restaurantId) return;
      
      if (!bookingsByRestaurant[restaurantId]) {
        bookingsByRestaurant[restaurantId] = {
          name: booking.restaurant.name,
          total: 0,
          active: 0,
          cancelled: 0,
          tables: 0
        };
      }
      
      bookingsByRestaurant[restaurantId].total += 1;
      
      if (booking.status === 'Booked') {
        bookingsByRestaurant[restaurantId].active += 1;
      } else {
        bookingsByRestaurant[restaurantId].cancelled += 1;
      }
      
      bookingsByRestaurant[restaurantId].tables += (booking.requiredTables || 1);
    });

    // Return analytics data
    res.json({
      totalBookings: bookings.length,
      activeBookings,
      cancelledBookings,
      totalTablesBooked,
      bookingsByRestaurant: Object.values(bookingsByRestaurant),
      bookings,
      dateRange: {
        start: startDate,
        end: new Date(),
        rangeName: range
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

/**
 * Get complete booking history
 */
exports.getBookingHistory = async (req, res) => {
  try {
    // Get all bookings, both active and cancelled
    const bookings = await Booking.find()
      .populate('restaurant', 'name city state zipCode cuisine')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching booking history:', err);
    res.status(500).json({ message: 'Failed to fetch booking history' });
  }
};

/**
 * Get restaurant booking statistics
 */
exports.getRestaurantStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Get all bookings for this restaurant
    const bookings = await Booking.find({ restaurant: id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === 'Booked').length;
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
    
    // Calculate total tables booked
    const totalTablesBooked = bookings.reduce((sum, booking) => {
      return sum + (booking.requiredTables || 1);
    }, 0);
    
    // Group bookings by day
    const bookingsByDay = {};
    bookings.forEach(booking => {
      const date = new Date(booking.date).toISOString().split('T')[0];
      
      if (!bookingsByDay[date]) {
        bookingsByDay[date] = {
          date,
          total: 0,
          active: 0,
          cancelled: 0,
          tables: 0
        };
      }
      
      bookingsByDay[date].total += 1;
      
      if (booking.status === 'Booked') {
        bookingsByDay[date].active += 1;
      } else {
        bookingsByDay[date].cancelled += 1;
      }
      
      bookingsByDay[date].tables += (booking.requiredTables || 1);
    });
    
    res.json({
      restaurant,
      stats: {
        totalBookings,
        activeBookings,
        cancelledBookings,
        totalTablesBooked,
        bookingsByDay: Object.values(bookingsByDay),
      },
      bookings
    });
  } catch (err) {
    console.error('Error fetching restaurant stats:', err);
    res.status(500).json({ message: 'Failed to fetch restaurant statistics' });
  }
};

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res) => {
  try {
    // Get user counts by role
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get the most active users (most bookings)
    const userBookings = await Booking.aggregate([
      {
        $group: {
          _id: '$user',
          bookingCount: { $sum: 1 },
          activeBookings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Booked'] }, 1, 0]
            }
          },
          cancelledBookings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          bookingCount: 1,
          activeBookings: 1,
          cancelledBookings: 1,
          name: '$userInfo.name',
          email: '$userInfo.email',
          role: '$userInfo.role'
        }
      }
    ]);
    
    res.json({
      userCounts,
      topUsers: userBookings
    });
  } catch (err) {
    console.error('Error fetching user statistics:', err);
    res.status(500).json({ message: 'Failed to fetch user statistics' });
  }
};

/**
 * Get recent system activity
 */
exports.getSystemActivity = async (req, res) => {
  try {
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('restaurant', 'name')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get recent restaurant registrations
    const recentRestaurants = await Restaurant.find()
      .populate('manager', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      recentBookings,
      recentRestaurants,
      recentUsers
    });
  } catch (err) {
    console.error('Error fetching system activity:', err);
    res.status(500).json({ message: 'Failed to fetch system activity' });
  }
};