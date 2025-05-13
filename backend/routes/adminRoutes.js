const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const adminController = require('../controllers/adminController');

// Apply authentication and role checking middleware
router.use(auth, roleCheck(['Admin']));

// Restaurant management routes
router.get('/restaurants', adminController.getAllRestaurants);
router.get('/pending', adminController.getPendingRestaurants);
router.put('/approve/:id', adminController.approveRestaurant);
router.delete('/remove/:id', adminController.removeRestaurant);

// Analytics and statistics routes
router.get('/analytics', adminController.getAnalytics);
router.get('/booking-history', adminController.getBookingHistory);
router.get('/restaurant-stats/:id', adminController.getRestaurantStats);
router.get('/user-stats', adminController.getUserStats);
router.get('/system-activity', adminController.getSystemActivity);

module.exports = router;