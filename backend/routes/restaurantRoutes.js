// restaurantRoutes.js (fixed)
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const restaurantController = require('../controllers/restaurantController');

// Restaurant management routes
router.post('/add', auth, roleCheck(['RestaurantManager']), restaurantController.addRestaurant);
router.put('/update/:id', auth, roleCheck(['RestaurantManager']), restaurantController.updateRestaurant);
router.delete('/delete/:id', auth, roleCheck(['RestaurantManager']), restaurantController.deleteRestaurant);
router.get('/my-listings', auth, roleCheck(['RestaurantManager']), restaurantController.getManagerListings);

// Booking management routes
// IMPORTANT: Specific routes must come before parameterized routes
router.get('/bookings/export/:restaurantId', auth, roleCheck(['RestaurantManager']), restaurantController.exportBookings);
router.get('/bookings/:restaurantId', auth, roleCheck(['RestaurantManager']), restaurantController.getRestaurantBookings);
router.put('/booking/:bookingId/approve', auth, roleCheck(['RestaurantManager']), restaurantController.approveBooking);
router.put('/booking/:bookingId/reject', auth, roleCheck(['RestaurantManager']), restaurantController.rejectBooking);



// Statistics routes
router.get('/stats/:restaurantId', auth, roleCheck(['RestaurantManager']), restaurantController.getRestaurantStats);

module.exports = router;