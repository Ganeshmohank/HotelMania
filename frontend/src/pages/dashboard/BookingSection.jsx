// BookingSection.jsx
import React, { useRef, useEffect } from 'react';

const BookingSection = ({
  restaurant,
  bookings,
  loading,
  tabView,
  setTabView,
  onExport,
  onApprove,
  onReject
}) => {
  const sectionRef = useRef(null);
  
  // Scroll to booking section when it becomes visible
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [restaurant?._id]);

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
    <div className="booking-section" ref={sectionRef}>
      <div className="booking-header">
        <h3>Bookings for: {restaurant?.name}</h3>
        <div className="booking-actions-container">
          <div className="booking-tabs">
            <button 
              className={`tab-button ${tabView === 'all' ? 'active' : ''}`}
              onClick={() => setTabView('all')}
            >
              All
            </button>
            <button 
              className={`tab-button ${tabView === 'pending' ? 'active' : ''}`}
              onClick={() => setTabView('pending')}
            >
              Pending
            </button>
            <button 
              className={`tab-button ${tabView === 'approved' ? 'active' : ''}`}
              onClick={() => setTabView('approved')}
            >
              Approved
            </button>
            <button 
              className={`tab-button ${tabView === 'rejected' ? 'active' : ''}`}
              onClick={() => setTabView('rejected')}
            >
              Rejected
            </button>
          </div>
          <button 
            className="btn export-btn" 
            onClick={onExport}
            disabled={bookings.length === 0}
          >
            📥 Export CSV
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="spinner-inline"></div>
      ) : bookings.length === 0 ? (
        <p className="empty">No {tabView !== 'all' ? tabView : ''} bookings found.</p>
      ) : (
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
                    {booking.status === 'approved' && (
                      <div className="booking-details">
                        {booking.confirmationCode && (
                          <span className="confirmation-code" title="Confirmation Code">
                            🎫 {booking.confirmationCode}
                          </span>
                        )}
                        {booking.tableNumber && (
                          <span className="table-number" title="Table Number">
                            🪑 {booking.tableNumber}
                          </span>
                        )}
                      </div>
                    )}
                    {booking.specialRequests && (
                      <button 
                        className="btn-icon notes-btn" 
                        title={`Special Requests: ${booking.specialRequests}`}
                      >
                        📝
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Optional: Add a booking details modal that appears when clicking on a booking */}
      {/* 
      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onApprove={onApprove}
          onReject={onReject}
          onAssignTable={handleAssignTable}
        />
      )}
      */}
    </div>
  );
};

export default BookingSection;