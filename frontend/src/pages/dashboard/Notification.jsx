// Notification.jsx
import React from 'react';

const Notification = ({ message, type = 'success' }) => {
  return (
    <div className={`notification-modal notification-${type}`}>
      <div className="modal notification-box">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Notification;