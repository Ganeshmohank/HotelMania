// MainDashboard.jsx - The main container component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import SearchTab from './tabs/SearchTab';
import BookingsTab from './tabs/BookingsTab';
import BookingHistoryTab from './tabs/BookingHistoryTab';
import ReviewsTab from './tabs/ReviewsTab';
import FavoritesTab from './tabs/FavoritesTab';
import NotificationsTab from './tabs/NotificationsTab';
import ProfileTab from './tabs/ProfileTab';
import BookingModal from './modals/BookingModal';
import '../styles/CustomerDashboard.css';

const MainDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || 'User';
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Tab state
  const [activeTab, setActiveTab] = useState('search');
  
  // UI state
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Shared state
  const [bookings, setBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  
  // Modal state
  const [showTimeModal, setShowTimeModal] = useState(null);
  const [modalDate, setModalDate] = useState(todayStr);
  const [modalTime, setModalTime] = useState('');
  const [editBooking, setEditBooking] = useState(null);
  const [requiredTables, setRequiredTables] = useState(1);
  const [search, setSearch] = useState({ 
    city: '', 
    zip: '', 
    cuisine: '', 
    minRating: '', 
    date: todayStr, 
    time: now.toTimeString().slice(0, 5), 
    people: 1, 
    sortBy: '' 
  });
  
  // Data fetching functions that are shared across components
  const fetchMyBookings = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/customer/my-bookings');
      setBookings(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Booking fetch error:', err);
      setSnackbarMsg('❌ Could not load bookings');
      setIsLoading(false);
    }
  };
  
  const fetchBookingHistory = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/customer/booking-history');
      setBookingHistory(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Booking history fetch error:', err);
      setSnackbarMsg('❌ Could not load booking history');
      setIsLoading(false);
    }
  };
  
  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/customer/favorites');
      setFavorites(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setSnackbarMsg('❌ Could not load favorites');
      setIsLoading(false);
    }
  };
  
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/customer/notifications');
      setNotifications(data);
      
      // Check for unread notifications
      const unreadCount = data.filter(n => !n.read).length;
      setHasUnread(unreadCount > 0);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setIsLoading(false);
    }
  };
  
  const fetchMyReviews = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/customer/my-reviews');
      setMyReviews(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch my reviews:', err);
      setSnackbarMsg('❌ Could not load your reviews');
      setIsLoading(false);
    }
  };
  
  // Booking functions
  const calculateRequiredTables = (people, maxPerTable) => {
    return Math.ceil(people / maxPerTable);
  };
  
  const handleEditBooking = booking => {
    setEditBooking(booking);
    setModalDate(new Date(booking.date).toISOString().split('T')[0]);
    setModalTime(booking.time);
    setShowTimeModal(booking.restaurant);
    
    // Set party size from the existing booking
    setSearch(prev => ({ ...prev, people: booking.numPeople }));
    
    // Calculate tables needed for this booking
    if (booking.restaurant && booking.restaurant.maxPeoplePerTable) {
      setRequiredTables(calculateRequiredTables(booking.numPeople, booking.restaurant.maxPeoplePerTable));
    }
  };
  
  const cancelBooking = async (bookingId) => {
    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        return;
      }
  
      // Make the API call to cancel the booking
      // Note the corrected API endpoint format
      const response = await axios.put(`/customer/booking/${bookingId}/cancel`);
      
      // Update the local state to reflect the cancellation
      setBookingHistory(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Booking cancelled successfully',
        type: 'success'
      });
      
      // Optionally fetch the updated booking list
      // fetchBookingHistory();
    } catch (error) {
      console.error('Cancellation error:', error);
      
      // Show error notification
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Failed to cancel booking. Please try again.',
        type: 'error'
      });
    }
  };
  
  const prepareForBooking = (restaurant) => {
    // Check if restaurant is fully booked
    if (restaurant.timesBookedToday >= restaurant.availableTables) {
      setSnackbarMsg('⚠️ This restaurant is fully booked today');
      return;
    }
    
    // Calculate required tables based on party size
    const tablesNeeded = calculateRequiredTables(parseInt(search.people), restaurant.maxPeoplePerTable);
    setRequiredTables(tablesNeeded);
    
    // Check if enough tables are available
    if (restaurant.availableTables - restaurant.timesBookedToday < tablesNeeded) {
      setSnackbarMsg(`⚠️ Not enough tables available for your party size. Need ${tablesNeeded} tables.`);
      return;
    }
    
    // If we have enough tables, proceed with booking modal
    setShowTimeModal(restaurant);
    setModalDate(search.date);
    setModalTime('');
  };
  
  const bookTable = async () => {
    if (!modalDate || !modalTime || !showTimeModal) {
      setSnackbarMsg('Please select a valid date and available time.');
      return;
    }
    
    // Calculate tables needed again just to be safe
    const tablesNeeded = calculateRequiredTables(parseInt(search.people), showTimeModal.maxPeoplePerTable);
    
    // Check again if enough tables are available
    if (showTimeModal.availableTables - showTimeModal.timesBookedToday < tablesNeeded) {
      setSnackbarMsg(`⚠️ Not enough tables available. Need ${tablesNeeded} tables.`);
      setShowTimeModal(null);
      return;
    }
    
    try {
      setIsLoading(true);
      if (editBooking) {
        await axios.put(`/customer/update-booking/${editBooking._id}`, {
          date: modalDate,
          time: modalTime,
          numPeople: parseInt(search.people),
          requiredTables: tablesNeeded
        });
        setSnackbarMsg('✅ Booking updated!');
        setEditBooking(null);
      } else {
        await axios.post('/customer/book', {
          restaurantId: showTimeModal._id,
          date: modalDate,
          time: modalTime,
          partySize: parseInt(search.people), // Use partySize instead of numPeople
          requiredTables: tablesNeeded
          // Don't set status here - it will default to 'pending'
        });
        setSnackbarMsg(`✅ Booking confirmed! Reserved ${tablesNeeded} ${tablesNeeded > 1 ? 'tables' : 'table'}`);
      }
      setShowTimeModal(null);
      fetchMyBookings();
      fetchBookingHistory();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setSnackbarMsg(err.response?.data?.message || '❌ Booking failed');
    }
  };
  
  // Initial data loading based on active tab
  useEffect(() => {
    // Load data based on active tab
    switch (activeTab) {
      case 'bookings':
        fetchMyBookings();
        break;
      case 'history':
        fetchBookingHistory();
        break;
      case 'reviews':
        fetchMyReviews();
        break;
      case 'favorites':
        fetchFavorites();
        break;
      case 'notifications':
        fetchNotifications();
        break;
      default:
        break;
    }
  }, [activeTab]);
  
  // Update required tables when people count changes
  useEffect(() => {
    if (showTimeModal) {
      const tablesNeeded = calculateRequiredTables(parseInt(search.people), showTimeModal.maxPeoplePerTable);
      setRequiredTables(tablesNeeded);
    }
  }, [search.people, showTimeModal]);
  
  // Handle snackbar timeout
  useEffect(() => {
    if (snackbarMsg) {
      const t = setTimeout(() => setSnackbarMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbarMsg]);
  
  // Toggle favorite function to be passed to child components
  const toggleFavorite = async (restaurantId) => {
    try {
      setIsLoading(true);
      const isFavorite = favorites.some(fav => fav._id === restaurantId);
      
      if (isFavorite) {
        await axios.delete(`/customer/favorites/${restaurantId}`);
        setSnackbarMsg('✅ Removed from favorites');
      } else {
        await axios.post('/customer/favorites', { restaurantId });
        setSnackbarMsg('✅ Added to favorites');
      }
      
      fetchFavorites();
      setIsLoading(false);
    } catch (err) {
      console.error('Toggle favorite error:', err);
      setSnackbarMsg('❌ Failed to update favorites');
      setIsLoading(false);
    }
  };
  
  const isRestaurantFavorite = (restaurantId) => {
    return favorites.some(fav => fav._id === restaurantId);
  };

  return (
    <div className="customer-dashboard">
      <header className="header">
        <h1>Welcome, {userName}!</h1>
        <div className="header-actions">
          {hasUnread && (
            <div className="notification-badge" onClick={() => setActiveTab('notifications')}>
              🔔
            </div>
          )}
          <button className="btn logout" onClick={() => { localStorage.clear(); navigate('/login'); }}>
            Logout
          </button>
        </div>
      </header>
      
      <nav className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Find Restaurants
        </button>
        {/* <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button> */}
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Bookings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          My Reviews
        </button>
        <button 
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications {hasUnread && <span className="badge">•</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </nav>
      
      {isLoading && <div className="loading-indicator">Loading...</div>}
      
      {/* Render the appropriate tab based on activeTab */}
      {activeTab === 'search' && (
        <SearchTab 
          search={search}
          setSearch={setSearch}
          setSnackbarMsg={setSnackbarMsg}
          setIsLoading={setIsLoading}
          prepareForBooking={prepareForBooking}
          toggleFavorite={toggleFavorite}
          isRestaurantFavorite={isRestaurantFavorite}
        />
      )}
      
      {/* {activeTab === 'bookings' && (
        <BookingsTab 
          bookings={bookings}
          handleEditBooking={handleEditBooking}
          cancelBooking={cancelBooking}
        />
      )} */}
      
      {activeTab === 'history' && (
        <BookingHistoryTab 
          bookingHistory={bookingHistory}
          handleEditBooking={handleEditBooking}
          cancelBooking={cancelBooking}
        />
      )}
      
      {activeTab === 'reviews' && (
        <ReviewsTab 
          myReviews={myReviews}
          setSnackbarMsg={setSnackbarMsg}
          setIsLoading={setIsLoading}
          setMyReviews={setMyReviews}
        />
      )}
      
      {activeTab === 'favorites' && (
        <FavoritesTab 
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          setActiveTab={setActiveTab}
          setSearch={setSearch}
          prepareForBooking={prepareForBooking}
        />
      )}
      
      {activeTab === 'notifications' && (
        <NotificationsTab 
          notifications={notifications}
          setIsLoading={setIsLoading}
          setSnackbarMsg={setSnackbarMsg}
          fetchNotifications={fetchNotifications}
        />
      )}
      
      {activeTab === 'profile' && (
        <ProfileTab 
          bookings={bookings}
          bookingHistory={bookingHistory}
          myReviews={myReviews}
          favorites={favorites}
          setSnackbarMsg={setSnackbarMsg}
          setIsLoading={setIsLoading}
        />
      )}
      
      {/* Booking Modal - shared across components */}
      {showTimeModal && (
        <BookingModal
          showTimeModal={showTimeModal}
          setShowTimeModal={setShowTimeModal}
          editBooking={editBooking}
          setEditBooking={setEditBooking}
          modalDate={modalDate}
          setModalDate={setModalDate}
          modalTime={modalTime}
          setModalTime={setModalTime}
          search={search}
          setSearch={setSearch}
          requiredTables={requiredTables}
          bookTable={bookTable}
          setSnackbarMsg={setSnackbarMsg}
        />
      )}
      
      {snackbarMsg && <div className="snackbar">{snackbarMsg}</div>}
    </div>
  );
};

export default MainDashboard;