// customerController.js
const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');
const { createNotification } = require('../utils/notificationUtil');


exports.searchRestaurants = async (req, res) => {
  try {
    const { name, city, state, zip, cuisine, minRating, date, time, people, sortBy } = req.query;
    const match = { approved: true };
    
    // Add name search with case-insensitive regex
    if (name) {
      match.name = { $regex: name, $options: 'i' };
    }
    
    if (city) match.city = city;
    if (state) match.state = state;
    if (zip) match.zipCode = zip;
    if (cuisine) match.cuisine = cuisine;

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $avg: '$reviews.rating' },
              null
            ]
          },
          reviewCount: { $size: { $ifNull: ['$reviews', []] } },
          // Generate Google Maps URL directly in the pipeline
          googleMapsUrl: {
            $cond: [
              // If location coordinates are valid
              { $and: [
                { $ne: [{ $type: "$location.coordinates" }, "missing"] },
                { $ne: [{ $arrayElemAt: ["$location.coordinates", 0] }, 0] },
                { $ne: [{ $arrayElemAt: ["$location.coordinates", 1] }, 0] }
              ]},
              // Use coordinates
              { $concat: [
                "https://www.google.com/maps?q=",
                { $toString: { $arrayElemAt: ["$location.coordinates", 1] } }, // latitude
                ",",
                { $toString: { $arrayElemAt: ["$location.coordinates", 0] } }  // longitude
              ]},
              // Fallback to address
              { $concat: [
                "https://www.google.com/maps/search/?api=1&query=",
                { $concat: [
                  { $ifNull: ["$address", ""] }, ", ",
                  { $ifNull: ["$city", ""] }, ", ",
                  { $ifNull: ["$state", ""] }, " ",
                  { $ifNull: ["$zipCode", ""] }
                ]}
              ]}
            ]
          }
        }
      }
    ];

    if (minRating) {
      pipeline.push({ $match: { avgRating: { $gte: parseFloat(minRating) } } });
    }

    // Add sorting if requested
    if (sortBy === 'rating') {
      pipeline.push({ $sort: { avgRating: -1 } });
    } else if (sortBy === 'cost') {
      pipeline.push({ $sort: { cost: 1 } });
    }

    pipeline.push({
      $project: {
        name: 1,
        address: 1,
        cuisine: 1,
        cost: 1,
        city: 1,
        state: 1,
        zipCode: 1,
        photos: 1,
        bookingTimes: 1,
        avgRating: 1,
        reviewCount: 1,
        availableTables: 1,
        maxPeoplePerTable: 1,
        location: 1,         // Include location field
        googleMapsUrl: 1     // Include the calculated URL
      }
    });

    const restaurants = await Restaurant.aggregate(pipeline);

    const target = date ? new Date(date.slice(0, 10)) : new Date();
    const start = new Date(target); start.setHours(0, 0, 0, 0);
    const end = new Date(target); end.setHours(23, 59, 59, 999);

    // Aggregate bookings to get total tables used, not just count of bookings
    const bookingCounts = await Booking.aggregate([
      { 
        $match: { 
          date: { $gte: start, $lte: end },
          status: 'Booked' // Only count active bookings
        } 
      },
      {
        $lookup: {
          from: 'restaurants', 
          localField: 'restaurant',
          foreignField: '_id',
          as: 'restaurantData'
        }
      },
      { $unwind: '$restaurantData' },
      {
        $group: { 
          _id: '$restaurant', 
          // Use requiredTables if available, otherwise calculate it
          tablesUsed: { 
            $sum: { 
              $cond: [
                { $gt: ["$requiredTables", 0] }, // If requiredTables field exists and > 0
                "$requiredTables", // Use it
                { 
                  $ceil: { 
                    $divide: [
                      "$numPeople", // Number of people in booking
                      { $max: [1, "$restaurantData.maxPeoplePerTable"] } // Max people per table (ensure no division by zero)
                    ] 
                  } 
                } // Otherwise calculate it
              ] 
            } 
          }
        }
      }
    ]);

    const tablesUsedMap = bookingCounts.reduce((m, c) => {
      m[c._id.toString()] = c.tablesUsed;
      return m;
    }, {});

    const output = restaurants.map(r => ({
      ...r,
      timesBookedToday: tablesUsedMap[r._id.toString()] || 0
    }));

    return res.json(output);
  } catch (err) {
    console.error('searchRestaurants error:', err);
    return res.status(500).json({ message: err.message });
  }
};


exports.bookTable = async (req, res) => {
  try {
    const { restaurantId, date, time, partySize, requiredTables, specialRequests } = req.body;

    if (!restaurantId || !date || !time || !partySize) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const booking = await Booking.create({
      user: req.user.userId,
      restaurant: restaurantId,
      date: new Date(date),
      time,
      partySize: parseInt(partySize),
      requiredTables,
      specialRequests: specialRequests || '',
      status: 'pending'
    });

    const subject = 'Booking Request Received - Hotel Mania';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2C7A7B; text-align: center;">Your Booking Request is Being Processed</h2>
        <p>Dear ${req.user.name || "Customer"},</p>
        <p>We've received your booking request for <strong>${restaurant.name}</strong>. Your booking is currently <strong>pending approval</strong> from the restaurant management.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(date).toDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 5px 0;"><strong>Party Size:</strong> ${partySize} people</p>
          <p style="margin: 5px 0;"><strong>Special Requests:</strong> ${specialRequests || 'None'}</p>
        </div>
        <p>You will receive another email once your booking has been confirmed. If you need to make changes or cancel your reservation, please visit your account on Hotel Mania.</p>
        <p>Thank you for choosing ${restaurant.name}!</p>
        <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
          <p>This is an automated message from Hotel Mania. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail(req.user.email, subject, html);
    } catch (emailError) {
      console.error('Error sending booking email:', emailError);
    }

    try {
      const noteText = `Your booking request for ${restaurant.name} on ${new Date(date).toDateString()} at ${time} is pending confirmation.`;
      await createNotification(
        req.user.userId,
        'booking',
        'Booking Request Received',
        noteText,
        { restaurantId, bookingId: booking._id }
      );

    } catch (notificationError) {
      console.error('Push notification error:', notificationError);
    }

    res.status(201).json({ 
      message: 'Booking request submitted and awaiting confirmation from the restaurant.',
      booking
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ 
      message: 'Failed to create booking',
      error: err.message
    });
  }
};

/**
 * Cancel a booking
 * @route PUT /api/customer/booking/:bookingId/cancel
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find the booking with restaurant data
    const booking = await Booking.findById(bookingId).populate('restaurant');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the booking belongs to the current user
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to cancel this booking' });
    }
    
    // Check if the booking can be cancelled (not already cancelled or rejected)
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }
    
    if (booking.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot cancel a booking that has been rejected' });
    }
    
    // Update booking status to cancelled
    booking.status = 'cancelled';
    booking.updatedBy = req.user.userId;
    
    // If we're keeping track of history
    if (Array.isArray(booking.statusHistory)) {
      booking.statusHistory.push({
        status: 'cancelled',
        updatedAt: new Date(),
        updatedBy: req.user.userId,
        note: 'Cancelled by customer'
      });
    }
    
    await booking.save();
    
    // Send cancellation email to the customer
    const subject = 'Booking Cancellation Confirmation - Hotel Mania';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2C7A7B; text-align: center;">Booking Cancellation Confirmed</h2>
        <p>Dear ${req.user.name|| "Customer"},</p>
        <p>Your booking at <strong>${booking.restaurant.name}</strong> has been successfully cancelled as requested.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(booking.date).toDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.time}</p>
          <p style="margin: 5px 0;"><strong>Party Size:</strong> ${booking.partySize} people</p>
        </div>
        <p>We hope to see you at Hotel Mania again soon. If you wish to make a new reservation, please visit our website or mobile app.</p>
        <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
          <p>This is an automated message from Hotel Mania. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail(req.user.email, subject, html);
      console.log(`Booking cancellation email sent to ${req.user.email}`);
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Continue with the response even if email fails
    }
    
    // Create notification
    try {
      await createNotification(
        req.user.userId,
        'cancellation',
        'Booking Cancelled',
        `Your booking at ${booking.restaurant.name} for ${new Date(booking.date).toDateString()} has been cancelled.`,
        { restaurantId: booking.restaurant._id, bookingId }
      );
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
    
    // Return the updated booking
    res.json({ 
      message: 'Booking has been successfully cancelled.',
      booking
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ 
      message: 'Failed to cancel booking',
      error: err.message 
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking
      .find({ 
        user: req.user.userId,
        status: 'Booked' // Only return active bookings
      })
      .populate('restaurant')
      .sort({ date: 1 }); // Sort by date ascending
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRestaurantReviews = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Get reviews
    // If reviews are embedded in restaurant model:
    // const reviews = restaurant.reviews || [];
    
    // If reviews are in a separate collection:
    const reviews = await Review.find({ restaurant: id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching restaurant reviews:', err);
    res.status(500).json({ 
      message: 'Error fetching restaurant reviews',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
};

exports.getRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the restaurant with populated reviews
    const restaurant = await Restaurant.findById(id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name' // Only include user name, not email or other sensitive data
        }
      });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // If restaurant requires approval and isn't approved, don't show it to customers
    if (restaurant.approved === false) {
      return res.status(403).json({ message: 'This restaurant is not available for viewing' });
    }
    
    // Get average rating from reviews (if your reviews are embedded in the restaurant model)
    const averageRating = restaurant.reviews && restaurant.reviews.length > 0
      ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / restaurant.reviews.length
      : 0;
    
    // Format the response
    const response = {
      ...restaurant.toObject(),
      averageRating: parseFloat(averageRating.toFixed(1))
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    res.status(500).json({ 
      message: 'Error fetching restaurant details',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be 1–5' });

    await Restaurant.updateOne(
      { _id: req.params.restaurantId },
      { $push: { reviews: { user: req.user.userId, rating, comment } } }
    );

    // return the updated restaurant (with avgRating)
    const restaurant = await Restaurant
      .findById(req.params.restaurantId)
      .populate('reviews.user','name')
      .lean();
    const revs = restaurant.reviews || [];
    restaurant.avgRating = revs.length
      ? revs.reduce((s,r) => s + r.rating, 0) / revs.length
      : null;

    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCuisines = async (req, res) => {
  try {
    const cuisines = await Restaurant.distinct('cuisine');
    const filtered = cuisines.filter(Boolean); // remove empty/null if any
    res.json(filtered);
  } catch (err) {
    console.error('Error fetching cuisines:', err);
    res.status(500).json({ message: 'Failed to fetch cuisines' });
  }
};

exports.updateReview = async (req, res) => {
  const { restaurantId, reviewId } = req.params;
  const { rating, comment } = req.body;
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    const review = restaurant.reviews.id(reviewId);
    if (!review || review.user.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Unauthorized' });

    review.rating = rating;
    review.comment = comment;
    await restaurant.save();
    res.json({ message: 'Review updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { restaurantId, reviewId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const review = restaurant.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this review' });
    }

    // Use subdocument remove correctly
    review.deleteOne();  // Use this instead of remove() or splice

    await restaurant.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  const bookingId = req.params.id;
  const { date, time, numPeople } = req.body;
  if (!date || !time || !numPeople) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find the booking with populated restaurant data
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      user: req.user.userId,
      status: 'Booked'
    }).populate('restaurant');
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const restaurant = booking.restaurant;
    
    // Calculate tables needed for the updated booking
    const updatedTablesNeeded = Math.ceil(numPeople / restaurant.maxPeoplePerTable);
    
    // Calculate the difference in tables from previous booking
    const oldTablesNeeded = booking.requiredTables || Math.ceil(booking.numPeople / restaurant.maxPeoplePerTable);
    const tablesDifference = updatedTablesNeeded - oldTablesNeeded;
    
    // Check if booking date is today
    const today = new Date();
    const bookingDate = new Date(date);
    const existingDate = new Date(booking.date);
    const isNewDateToday = bookingDate.getDate() === today.getDate() && 
                           bookingDate.getMonth() === today.getMonth() && 
                           bookingDate.getFullYear() === today.getFullYear();
    const wasOldDateToday = existingDate.getDate() === today.getDate() && 
                           existingDate.getMonth() === today.getMonth() && 
                           existingDate.getFullYear() === today.getFullYear();
    
    // If tables needed increase for today, check availability
    if (tablesDifference > 0 && isNewDateToday) {
      // Get today's bookings to check availability
      const start = new Date(today); start.setHours(0, 0, 0, 0);
      const end = new Date(today); end.setHours(23, 59, 59, 999);
      
      const bookingCounts = await Booking.aggregate([
        { 
          $match: { 
            restaurant: restaurant._id,
            date: { $gte: start, $lte: end },
            status: 'Booked',
            _id: { $ne: booking._id } // Exclude the current booking
          } 
        },
        {
          $group: { 
            _id: null, 
            tablesUsed: { 
              $sum: { 
                $cond: [
                  { $gt: ["$requiredTables", 0] },
                  "$requiredTables",
                  { 
                    $ceil: { 
                      $divide: ["$numPeople", restaurant.maxPeoplePerTable] 
                    } 
                  }
                ] 
              } 
            }
          }
        }
      ]);

      const tablesInUse = bookingCounts.length > 0 ? bookingCounts[0].tablesUsed : 0;
      
      // Check if enough tables are available
      if (restaurant.availableTables - tablesInUse < updatedTablesNeeded) {
        return res.status(400).json({ 
          message: `Cannot update booking. Need ${updatedTablesNeeded} tables, but only ${restaurant.availableTables - tablesInUse} available.` 
        });
      }
    }

    // Update the booking
    booking.date = date;
    booking.time = time;
    booking.numPeople = numPeople;
    booking.requiredTables = updatedTablesNeeded;
    await booking.save();

    // Send email notification to the customer
    const subject = 'Booking Updated - Hotel Mania';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2C7A7B; text-align: center;">Your Booking Has Been Updated</h2>
        <p>Dear ${req.user.name|| "Customer"},</p>
        <p>Your booking at <strong>${restaurant.name}</strong> has been successfully updated with the following details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(date).toDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 5px 0;"><strong>Party Size:</strong> ${numPeople} people</p>
          <p style="margin: 5px 0;"><strong>Tables Reserved:</strong> ${updatedTablesNeeded}</p>
        </div>
        <p>If you need to make any further changes to your reservation, please visit your account on Hotel Mania.</p>
        <p>We look forward to welcoming you at ${restaurant.name}!</p>
        <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
          <p>This is an automated message from Hotel Mania. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail(req.user.email, subject, html);
      console.log(`Booking update email sent to ${req.user.email}`);
    } catch (emailError) {
      console.error('Error sending update email:', emailError);
      // Continue with the response even if email fails
    }

    // Create notification
    try {
      await createNotification(
        req.user.userId,
        'update',
        'Booking Updated',
        `Your booking at ${restaurant.name} has been updated to ${new Date(date).toDateString()} at ${time}.`,
        { restaurantId: restaurant._id, bookingId }
      );
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    res.status(200).json({ 
      message: 'Booking updated successfully and notification sent', 
      booking,
      tablesReserved: updatedTablesNeeded
    });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.sendBookingReminders = async () => {
  try {
    // Find bookings for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const bookings = await Booking.find({
      date: {
        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
      },
      status: 'Booked'
    }).populate('restaurant user');
    
    // Send reminder for each booking
    for (const booking of bookings) {
      await createNotification(
        booking.user._id,
        'reminder',
        'Upcoming Reservation',
        `Reminder: You have a reservation at ${booking.restaurant.name} tomorrow at ${booking.time}.`,
        { restaurant: booking.restaurant._id, booking: booking._id }
      );
    }
    
    console.log(`Sent ${bookings.length} booking reminders`);
  } catch (err) {
    console.error('Error sending reminders:', err);
  }
};