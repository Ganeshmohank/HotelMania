// NotificationsTab.jsx
import axios from '../../api/axiosInstance';

const NotificationsTab = ({ 
  notifications, 
  setIsLoading, 
  setSnackbarMsg,
  fetchNotifications
}) => {
  const markAllNotificationsRead = async () => {
    try {
      setIsLoading(true);
      await axios.put('/customer/notifications/mark-all-read');
      fetchNotifications();
      setSnackbarMsg('✅ All notifications marked as read');
      setIsLoading(false);
    } catch (err) {
      console.error('Mark all read error:', err);
      setSnackbarMsg('❌ Failed to mark notifications as read');
      setIsLoading(false);
    }
  };
  
  const deleteNotification = async (notificationId) => {
    try {
      setIsLoading(true);
      await axios.delete(`/customer/notifications/${notificationId}`);
      fetchNotifications();
      setSnackbarMsg('✅ Notification deleted');
      setIsLoading(false);
    } catch (err) {
      console.error('Delete notification error:', err);
      setSnackbarMsg('❌ Failed to delete notification');
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return '📅';
      case 'reminder': return '⏰';
      case 'system': return '🔔';
      case 'review': return '⭐';
      default: return '📣';
    }
  };

  return (
    <section className="tab-content notifications-section">
      <div className="section-header">
        <h2>Notifications</h2>
        {notifications.length > 0 && (
          <button className="btn secondary" onClick={markAllNotificationsRead}>
            Mark All as Read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <p className="no-items">You don't have any notifications.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.read ? '' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <p className="notification-date">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                className="delete-notification" 
                onClick={() => deleteNotification(notification._id)}
                title="Delete notification"
                aria-label="Delete notification"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NotificationsTab;