import React from 'react';

const BookingTable = ({ bookings, onApprove, onReject }) => {
  const formatDate = (dateString) => {
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="booking-container">
      <table className="booking-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Party Size</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking._id}>
              <td>{formatDate(booking.date)}</td>
              <td>{booking.time}</td>
              <td>{booking.user?.name || 'Unknown'}</td>
              <td>{booking.user?.email || 'N/A'}</td>
              <td>{booking.partySize || '?'}</td>
              <td>
                <span className={`status-badge ${getStatusClass(booking.status)}`}>
                  {booking.status || 'pending'}
                </span>
              </td>
              <td className="booking-actions">
                {(!booking.status || booking.status === 'pending') && (
                  <>
                    <button 
                      className="btn-icon approve-btn" 
                      onClick={() => onApprove(booking._id)}
                      aria-label="Approve booking"
                      title="Approve booking"
                    >
                      ✅
                    </button>
                    <button 
                      className="btn-icon reject-btn" 
                      onClick={() => onReject(booking._id)}
                      aria-label="Reject booking"
                      title="Reject booking"
                    >
                      ❌
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;