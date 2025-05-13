// utils/notificationUtil.js
const User = require('../models/User');

/**
 * Create a notification for a user
 * @param {String} userId - User ID
 * @param {String} type - Notification type: 'booking', 'reminder', 'system', 'review'
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {Object} meta - Optional metadata (restaurant ID, booking ID, etc.)
 */
exports.createNotification = async (userId, type, title, message, meta = {}) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }
    
    const notification = {
      type,
      title,
      message,
      read: false,
      ...meta
    };
    
    user.notifications.push(notification);
    await user.save();
    
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};