const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const customerController = require('../controllers/customerController');
const profileController = require('../controllers/profileController');
const restaurantController =  require('../controllers/restaurantController');
// Apply auth middleware to all routes
router.use(auth);
router.use(roleCheck(['Customer']));

// Original restaurant and booking routes
router.get('/search', customerController.searchRestaurants);
router.get('/cuisines', customerController.getCuisines);
router.get('/get-restaurant/:id', customerController.getRestaurant);
router.post('/book', customerController.bookTable);
router.get('/my-bookings', customerController.getMyBookings);
router.put('/booking/:bookingId/cancel', auth, customerController.cancelBooking);
router.put('/update-booking/:id', customerController.updateBooking);
router.get('/get-restaurant-reviews/:id', auth, customerController.getRestaurantReviews);
// Review routes
router.post('/review/:restaurantId', customerController.addReview);
router.put('/review/:restaurantId/:reviewId', customerController.updateReview);
router.delete('/review/:restaurantId/:reviewId', customerController.deleteReview);

// Profile management routes
router.get('/profile', profileController.getUserProfile);
router.put('/update-profile', profileController.updateUserProfile);
router.get('/getActiveBookings', profileController.getMyBookings);
// Review management routes
router.get('/my-reviews', profileController.getUserReviews);

// Favorites routes
router.get('/favorites', profileController.getFavorites);
router.post('/favorites', profileController.addFavorite);
router.delete('/favorites/:id', profileController.removeFavorite);

// Booking history route
router.get('/booking-history', profileController.getBookingHistory);

// Notification routes
// routes/customerRoutes.js
const notificationController = require('../controllers/notificationController');

// Notification routes
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markNotificationRead);
router.put('/notifications/mark-all-read', notificationController.markAllNotificationsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);



router.get('/stats/:restaurantId', auth, roleCheck(['RestaurantManager']), restaurantController.getRestaurantStats);
router.put('/booking/:bookingId/approve', auth, roleCheck(['RestaurantManager']), restaurantController.approveBooking);
router.put('/booking/:bookingId/reject', auth, roleCheck(['RestaurantManager']), restaurantController.rejectBooking);
router.get('/bookings/export/:restaurantId', auth, roleCheck(['RestaurantManager']), restaurantController.exportBookings);


module.exports = router;