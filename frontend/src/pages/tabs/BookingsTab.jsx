// BookingsTab.jsx - Beautified and Enhanced
import { useRef, useState } from 'react';
import fallbackImage from '../../assets/image.png';
import "../../styles/BookingsTab.css"
const BookingsTab = ({ bookings, handleEditBooking, cancelBooking }) => {
  const bookingsRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState('approved'); // 'approved', 'all'
  
  // Helper function to format date to display day name
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Helper to get time remaining until booking
  const getTimeRemaining = (dateString, timeString) => {
    try {
      const [hours1, minutes] = timeString.split(':');
      const bookingDate = new Date(dateString);
      bookingDate.setHours(parseInt(hours1, 10), parseInt(minutes, 10), 0, 0);
      
      const now = new Date();
      const diff = bookingDate - now;
      
      // If the booking is in the past
      if (diff < 0) return 'Booking time passed';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
      } else {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    } catch (e) {
      return 'Time unknown';
    }
  };
  
  // Filter active bookings (status = approved & date >= today)
  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'approved') {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return booking.status === 'approved' && bookingDate >= today;
    }
    return true; // Show all if not filtering
  });
  
  // Sort bookings by date (closest first)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  return (
    <section className="tab-content booking-tab-section" ref={bookingsRef}>
      <div className="booking-header">
        <h2>My Upcoming Reservations</h2>
        
        <div className="booking-actions">
          <div className="booking-filter">
            <button 
              className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              Upcoming
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All Bookings
            </button>
          </div>
          
          <button 
            className="btn primary new-booking-btn"
            onClick={() => document.querySelector('[data-tab="search"]').click()}
          >
            + New Booking
          </button>
        </div>
      </div>
      
      {sortedBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No upcoming reservations</h3>
          <p>You don't have any active restaurant reservations</p>
          <button 
            className="btn primary find-restaurants-btn"
            onClick={() => document.querySelector('[data-tab="search"]').click()}
          >
            Find Restaurants
          </button>
        </div>
      ) : (
        <>
          <div className="booking-cards">
            {sortedBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-image">
                  <img 
                    src={booking.restaurant?.photos?.[0] || fallbackImage} 
                    alt={booking.restaurant?.name}
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = fallbackImage; 
                    }}
                  />
                  <div className="booking-countdown">
                    {getTimeRemaining(booking.date, booking.time)}
                  </div>
                </div>
                
                <div className="booking-card-content">
                  <div className="booking-restaurant-info">
                    <h3>{booking.restaurant?.name || 'Unknown Restaurant'}</h3>
                    <p className="restaurant-cuisine">{booking.restaurant?.cuisine || 'Restaurant'}</p>
                  </div>
                  
                  <div className="booking-date-time">
                    <div className="booking-date">
                      <span className="date-icon">📅</span>
                      <span className="date-text">{formatDate(booking.date)}</span>
                    </div>
                    <div className="booking-time">
                      <span className="time-icon">⏰</span>
                      <span className="time-text">{booking.time}</span>
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="booking-people">
                      <span className="detail-icon">👥</span>
                      <span className="detail-text">
                        {booking.partySize} {booking.partySize > 1 ? 'people' : 'person'}
                      </span>
                    </div>
                    <div className="booking-tables">
                      <span className="detail-icon">🪑</span>
                      <span className="detail-text">
                        {booking.requiredTables || 1} {booking.requiredTables !== 1 ? 'tables' : 'table'}
                      </span>
                    </div>
                    <div className="booking-location">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{booking.restaurant?.city || 'Unknown location'}</span>
                    </div>
                  </div>
                  
                  {booking.specialRequests && (
                    <div className="booking-special-requests">
                      <h4>Special Requests:</h4>
                      <p>{booking.specialRequests}</p>
                    </div>
                  )}
                  
                  {booking.confirmationCode && (
                    <div className="booking-confirmation">
                      <span className="confirmation-label">Confirmation:</span>
                      <span className="confirmation-code">{booking.confirmationCode}</span>
                    </div>
                  )}
                  
                  <div className="booking-card-buttons">
                    <button 
                      className="btn edit-btn" 
                      onClick={() => handleEditBooking(booking)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button 
                      className="btn cancel-btn" 
                      onClick={() => cancelBooking(booking._id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="booking-tips">
            <h3>Reservation Tips</h3>
            <ul>
              <li>
                <span className="tip-icon">⏰</span>
                <span className="tip-text">Arrive 5-10 minutes before your reservation time</span>
              </li>
              <li>
                <span className="tip-icon">📞</span>
                <span className="tip-text">Call the restaurant if you're running more than 15 minutes late</span>
              </li>
              <li>
                <span className="tip-icon">✏️</span>
                <span className="tip-text">You can modify your booking up to 2 hours before your reservation</span>
              </li>
              <li>
                <span className="tip-icon">🎉</span>
                <span className="tip-text">Let the restaurant know if you're celebrating a special occasion</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </section>
  );
};

export default BookingsTab;