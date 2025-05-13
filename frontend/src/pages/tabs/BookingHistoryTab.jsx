// BookingHistoryTab.jsx - Enhanced UI with Updated Logic
import { useState } from 'react';
import "../../styles/BookingHistoryTab.css"
const BookingHistoryTab = ({ bookingHistory, handleEditBooking, cancelBooking }) => {
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected', 'cancelled'
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  
  // Map UI-friendly status names to actual status values in the database
  const statusMapping = {
    'active': 'approved',    // Show approved bookings as "active" in UI
    'pending': 'pending',    // Bookings awaiting confirmation
    'cancelled': 'cancelled', // Cancelled bookings
    'rejected': 'rejected'   // Rejected bookings
  };
  
  // Filter bookings based on status, search text and sort order
  const filteredBookings = bookingHistory
    .filter(booking => {
      // Status filter
      if (bookingFilter !== 'all') {
        const targetStatus = statusMapping[bookingFilter];
        if (booking.status !== targetStatus) return false;
      }
      
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const restaurantName = (booking.restaurant?.name || '').toLowerCase();
        const date = new Date(booking.date).toLocaleDateString().toLowerCase();
        const confirmationCode = (booking.confirmationCode || '').toLowerCase();
        
        return restaurantName.includes(searchLower) || 
               date.includes(searchLower) || 
               confirmationCode.includes(searchLower);
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date (newest or oldest first based on user selection)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  // Format date with day name
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get user-friendly status display text
  const getStatusDisplayText = (status) => {
    switch(status) {
      case 'approved': return 'Confirmed';
      case 'pending': return 'Pending Confirmation';
      case 'rejected': return 'Declined';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Get CSS class for status styling
  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      case 'cancelled': return 'cancelled';
      default: return '';
    }
  };

  // Count bookings by status
  const countByStatus = (status) => {
    return bookingHistory.filter(b => b.status === status).length;
  };

  return (
    <section className="tab-content booking-history-section">
      <div className="section-header">
        <h2>Booking History</h2>
        <div className="booking-status-summary">
          <div className="status-count">
            <span className="count">{countByStatus('approved')}</span>
            <span className="label">Confirmed</span>
          </div>
          <div className="status-count">
            <span className="count">{countByStatus('pending')}</span>
            <span className="label">Pending</span>
          </div>
          <div className="status-count">
            <span className="count">{countByStatus('cancelled') + countByStatus('rejected')}</span>
            <span className="label">Cancelled/Declined</span>
          </div>
          <div className="status-count">
            <span className="count">{bookingHistory.length}</span>
            <span className="label">Total</span>
          </div>
        </div>
      </div>
      
      <div className="booking-history-filters">
        <div className="filter-group">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${bookingFilter === 'all' ? 'active' : ''}`}
              onClick={() => setBookingFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${bookingFilter === 'active' ? 'active' : ''}`}
              onClick={() => setBookingFilter('active')}
            >
              Confirmed
            </button>
            <button 
              className={`filter-btn ${bookingFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setBookingFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${bookingFilter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setBookingFilter('cancelled')}
            >
              Cancelled
            </button>
            <button 
              className={`filter-btn ${bookingFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setBookingFilter('rejected')}
            >
              Declined
            </button>
          </div>
        </div>
        
        <div className="filter-group">
          <div className="search-box">
            <input
              type="text"
              placeholder=" 🔍  Search by restaurant, date or confirmation code... "
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-group">
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No bookings found</h3>
          <p>{searchText ? "Try adjusting your search" : "You don't have any bookings in this category"}</p>
        </div>
      ) : (
        <div className="booking-history-list modern">
          <div className="booking-history-cards">
            {filteredBookings.map(booking => (
              <div 
                key={booking._id} 
                className={`booking-history-card ${getStatusClass(booking.status)}`}
              >
                <div className="booking-card-status">
                  <span className={`status-indicator ${getStatusClass(booking.status)}`}></span>
                  <span className="status-text">{getStatusDisplayText(booking.status)}</span>
                </div>
                
                <div className="booking-card-restaurant">
                  <h3>{booking.restaurant?.name || 'Unknown Restaurant'}</h3>
                  <p className="restaurant-cuisine">{booking.restaurant?.cuisine || 'Restaurant'}</p>
                </div>
                
                <div className="booking-card-details">
                  <div className="booking-card-dates">
                    <div className="booking-detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{formatDate(booking.date)}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{booking.time}</span>
                    </div>
                  </div>
                  
                  <div className="booking-card-people">
                    <div className="booking-detail-item">
                      <span className="detail-label">People</span>
                      <span className="detail-value">{booking.partySize}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-label">Tables</span>
                      <span className="detail-value">{booking.requiredTables || 1}</span>
                    </div>
                  </div>
                </div>
                
                {booking.confirmationCode && (
                  <div className="booking-confirmation">
                    <span className="confirmation-label">Confirmation Code:</span>
                    <span className="confirmation-code">{booking.confirmationCode}</span>
                  </div>
                )}
                
                <div className="booking-card-meta">
                  <span className="booking-created">Booked on: {new Date(booking.createdAt).toLocaleDateString()}</span>
                  
                  {booking.status === 'approved' && (
                    <div className="booking-card-actions">
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEditBooking(booking)}
                        title="Edit booking"
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn cancel" 
                        onClick={() => cancelBooking(booking._id)}
                        title="Cancel booking"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {booking.status === 'pending' && (
                    <div className="booking-pending-notice">
                      Waiting for restaurant confirmation
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default BookingHistoryTab;