// import { useState, useEffect, useRef } from 'react';
// import axios from '../api/axiosInstance';
// import { useNavigate } from 'react-router-dom';
// import '../styles/CustomerDashboard.css';
// import fallbackImage from '../assets/image.png';

// const CustomerDashboard = () => {
//   const navigate = useNavigate();
//   const userName = localStorage.getItem('name') || 'User';
//   const userId = localStorage.getItem('userId');

//   const now = new Date();
//   const todayStr = now.toISOString().split('T')[0];
//   const timeNowStr = now.toTimeString().slice(0, 5);
//   const [search, setSearch] = useState({ city: '', zip: '', cuisine: '', minRating: '', date: todayStr, time: timeNowStr, people: 1, sortBy: '' });
//   const [results, setResults] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [cuisines, setCuisines] = useState([]);
//   const [selectedRest, setSelectedRest] = useState(null);
//   const [showTimeModal, setShowTimeModal] = useState(null);
//   const [modalDate, setModalDate] = useState(todayStr);
//   const [modalTime, setModalTime] = useState('');
//   const [snackbarMsg, setSnackbarMsg] = useState('');
//   const [reviews, setReviews] = useState([]);
//   const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
//   const [editingReviewId, setEditingReviewId] = useState(null);
//   const [editBooking, setEditBooking] = useState(null);
//   const [requiredTables, setRequiredTables] = useState(1);
//   const bookingsRef = useRef(null);
//   const reviewsRef = useRef(null);

//   const dismissReviews = () => {
//     setSelectedRest(null);
//     setReviews([]);
//   };

//   const handleChange = e => setSearch(s => ({ ...s, [e.target.name]: e.target.value }));
//   const resetFilters = () => {
//     setSearch({ city: '', zip: '', cuisine: '', minRating: '', date: todayStr, time: '', people: 1, sortBy: '' });
//   };

//   // Calculate required tables based on party size and restaurant capacity
//   const calculateRequiredTables = (people, maxPerTable) => {
//     return Math.ceil(people / maxPerTable);
//   };

//   const fetchCuisines = async () => {
//     try {
//       const res = await axios.get('/customer/cuisines');
//       setCuisines(res.data);
//     } catch (err) {
//       console.error('Failed to fetch cuisines:', err);
//     }
//   };

//   const searchRestaurants = async () => {
//     try {
//       const { data } = await axios.get('/customer/search', { params: search });
//       setResults(data);
//     } catch (err) {
//       console.error('Search error', err);
//     }
//   };

//   const fetchMyBookings = async () => {
//     try {
//       const { data } = await axios.get('/customer/my-bookings');
//       setBookings(data);
//     } catch (err) {
//       console.error('Booking fetch error', err);
//     }
//   };

//   const viewReviews = async (restaurantId) => {
//     try {
//       const res = await axios.get(`/customer/get-restaurant/${restaurantId}`);
//       setSelectedRest(res.data);
//       setReviews(res.data.reviews || []);
//       setTimeout(() => {
//         reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 200);
//     } catch (err) {
//       console.error('Failed to fetch reviews:', err);
//     }
//   };

//   const submitReview = async (restaurantId) => {
//     try {
//       if (editingReviewId) {
//         await axios.put(`/customer/review/${restaurantId}/${editingReviewId}`, newReview);
//         setSnackbarMsg('✅ Review updated!');
//       } else {
//         await axios.post(`/customer/review/${restaurantId}`, newReview);
//         setSnackbarMsg('✅ Review submitted!');
//       }
//       setNewReview({ rating: 5, comment: '' });
//       setEditingReviewId(null);
//       viewReviews(restaurantId);
//     } catch (err) {
//       setSnackbarMsg('❌ Failed to submit review');
//     }
//   };

//   const deleteReview = async (restaurantId, reviewId) => {
//     try {
//       await axios.delete(`/customer/review/${restaurantId}/${reviewId}`);
//       setSnackbarMsg('🗑️ Review deleted');
//       viewReviews(restaurantId);
//     } catch (err) {
//       console.error('Delete review failed:', err);
//       setSnackbarMsg('❌ Failed to delete review');
//     }
//   };

//   const cancelBooking = async id => {
//     try {
//       const response = await axios.delete(`/customer/cancel/${id}`);
      
//       // Display success message with info about tables freed up
//       if (response.data.tablesFreed) {
//         setSnackbarMsg(`✅ Booking cancelled! ${response.data.tablesFreed} ${response.data.tablesFreed > 1 ? 'tables' : 'table'} freed up.`);
//       } else {
//         setSnackbarMsg('✅ Booking cancelled!');
//       }
      
//       // Refresh both bookings and available restaurants
//       fetchMyBookings();
//       searchRestaurants(); // Refresh restaurant data to update availability
//     } catch (err) {
//       setSnackbarMsg('❌ Failed to cancel booking.');
//       console.error('Cancellation error:', err);
//     }
//   };

//   // Update booking endpoint
//   const handleEditBooking = booking => {
//     setEditBooking(booking);
//     setModalDate(new Date(booking.date).toISOString().split('T')[0]);
//     setModalTime(booking.time);
//     setShowTimeModal(booking.restaurant);
    
//     // Set party size from the existing booking
//     setSearch(prev => ({ ...prev, people: booking.numPeople }));
    
//     // Calculate tables needed for this booking
//     if (booking.restaurant && booking.restaurant.maxPeoplePerTable) {
//       setRequiredTables(calculateRequiredTables(booking.numPeople, booking.restaurant.maxPeoplePerTable));
//     }
//   };

//   const prepareForBooking = (restaurant) => {
//     // Check if restaurant is fully booked
//     if (restaurant.timesBookedToday >= restaurant.availableTables) {
//       setSnackbarMsg('⚠️ This restaurant is fully booked today');
//       return;
//     }
    
//     // Calculate required tables based on party size
//     const tablesNeeded = calculateRequiredTables(parseInt(search.people), restaurant.maxPeoplePerTable);
//     setRequiredTables(tablesNeeded);
    
//     // Check if enough tables are available
//     if (restaurant.availableTables - restaurant.timesBookedToday < tablesNeeded) {
//       setSnackbarMsg(`⚠️ Not enough tables available for your party size. Need ${tablesNeeded} tables.`);
//       return;
//     }
    
//     // If we have enough tables, proceed with booking modal
//     setShowTimeModal(restaurant);
//     setModalDate(search.date);
//     setModalTime('');
//   };

//   const bookTable = async () => {
//     if (!modalDate || !modalTime || !showTimeModal) {
//       setSnackbarMsg('Please select a valid date and available time.');
//       return;
//     }
    
//     // Calculate tables needed again just to be safe
//     const tablesNeeded = calculateRequiredTables(parseInt(search.people), showTimeModal.maxPeoplePerTable);
    
//     // Check again if enough tables are available
//     if (showTimeModal.availableTables - showTimeModal.timesBookedToday < tablesNeeded) {
//       setSnackbarMsg(`⚠️ Not enough tables available. Need ${tablesNeeded} tables.`);
//       setShowTimeModal(null);
//       return;
//     }
    
//     try {
//       if (editBooking) {
//         await axios.put(`/customer/update-booking/${editBooking._id}`, {
//           date: modalDate,
//           time: modalTime,
//           numPeople: parseInt(search.people),
//           requiredTables: tablesNeeded // Include number of tables needed
//         });
//         setSnackbarMsg('✅ Booking updated!');
//         setEditBooking(null);
//       } else {
//         await axios.post('/customer/book', {
//           restaurantId: showTimeModal._id,
//           date: modalDate,
//           time: modalTime,
//           numPeople: parseInt(search.people),
//           requiredTables: tablesNeeded // Send number of tables needed to backend
//         });
//         setSnackbarMsg(`✅ Booking confirmed! Reserved ${tablesNeeded} ${tablesNeeded > 1 ? 'tables' : 'table'}`);
//       }
//       setShowTimeModal(null);
//       fetchMyBookings();
//       searchRestaurants(); // Refresh restaurant availability
//     } catch (err) {
//       setSnackbarMsg(err.response?.data?.message || '❌ Booking failed');
//     }
//   };

//   // Check if enough tables are available based on party size
//   const isBookingPossible = (restaurant, peopleCount) => {
//     const tablesNeeded = calculateRequiredTables(peopleCount, restaurant.maxPeoplePerTable);
//     return restaurant.availableTables - restaurant.timesBookedToday >= tablesNeeded;
//   };

//   useEffect(() => {
//     navigator.geolocation?.getCurrentPosition(async pos => {
//       const { latitude, longitude } = pos.coords;
//       try {
//         const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
//         const data = await response.json();
//         const city = data.address.city || data.address.town || data.address.village || '';
//         const zip = data.address.postcode || '';
//         setSearch(prev => ({ ...prev, city, zip }));
//       } catch (err) {
//         console.error('Location fetch failed:', err);
//       }
//     });
//     fetchCuisines();
//     fetchMyBookings();
//     searchRestaurants();
//   }, []);

//   // Update required tables when people count changes
//   useEffect(() => {
//     if (showTimeModal) {
//       const tablesNeeded = calculateRequiredTables(parseInt(search.people), showTimeModal.maxPeoplePerTable);
//       setRequiredTables(tablesNeeded);
//     }
//   }, [search.people, showTimeModal]);

//   useEffect(() => {
//     if (snackbarMsg) {
//       const t = setTimeout(() => setSnackbarMsg(''), 3000);
//       return () => clearTimeout(t);
//     }
//   }, [snackbarMsg]);

//   return (
//     <div className="customer-dashboard">
//       <header className="header">
//         <h1>Welcome, {userName}!</h1>
//         <button className="btn logout" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
//       </header>

//       <section className="filters sticky">
//         <label>City<input name="city" value={search.city} onChange={handleChange} placeholder="City" /></label>
//         <label>Zip<input name="zip" value={search.zip} onChange={handleChange} placeholder="Zip Code" /></label>
//         <label>Cuisine<select name="cuisine" value={search.cuisine} onChange={handleChange}>
//           <option value="">All</option>
//           {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
//         </select></label>
//         <label>Min Rating<select name="minRating" value={search.minRating} onChange={handleChange}>
//           <option value="">Any</option>
//           {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>≥ {n} ⭐</option>)}
//         </select></label>
//         <label>Date<input type="date" name="date" value={search.date} onChange={handleChange} className="light-input" /></label>
//         <label>Time<input type="time" name="time" value={search.time} onChange={handleChange} className="light-input" /></label>
//         <label>People<input type="number" name="people" min="1" value={search.people} onChange={handleChange} /></label>
//         <label>Sort By<select name="sortBy" value={search.sortBy} onChange={handleChange}>
//           <option value="">None</option>
//           <option value="rating">Rating</option>
//           <option value="cost">Cost</option>
//         </select></label>
//         <div className="filter-actions">
//           <button className="btn" onClick={searchRestaurants}>Search</button>
//           <button className="btn secondary" onClick={resetFilters}>Reset</button>
//         </div>
//       </section>

//       <section className="results">
//         <h2>Available Restaurants</h2>
//         {results.length === 0 ? <p>No matching restaurants.</p> : (
//           <div className="cards-grid">
//             {results.map(rest => {
//               // Calculate tables needed and availability
//               const tablesNeeded = calculateRequiredTables(parseInt(search.people), rest.maxPeoplePerTable);
//               const availableTables = rest.availableTables - rest.timesBookedToday;
//               const isFullyBooked = availableTables <= 0;
//               const notEnoughTables = availableTables < tablesNeeded;
              
//               return (
//                 <div key={rest._id} className="card">
//                   <img
//                     src={rest.photos[0] || fallbackImage}
//                     alt={rest.name}
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = fallbackImage;
//                     }}
//                   />
//                   <div className="card-body">
//                     <h3>{rest.name}</h3>
//                     <p>
//                       {rest.reviewCount > 0
//                         ? `${rest.city} — ${rest.cuisine} | 💰 ${rest.cost} | ⭐ ${rest.avgRating?.toFixed(1)} (${rest.reviewCount} reviews)`
//                         : `${rest.city} — ${rest.cuisine} | 💰 ${rest.cost} | No reviews`}
//                     </p>

//                     <p>Tables: {rest.availableTables} | Max/Table: {rest.maxPeoplePerTable}</p>
                    
//                     {isFullyBooked ? (
//                       <p className="full-booked">⚠️ Fully booked today</p>
//                     ) : notEnoughTables ? (
//                       <p className="full-booked">⚠️ Need {tablesNeeded} tables, only {availableTables} available</p>
//                     ) : (
//                       <p>Available: {availableTables} tables (Your party needs {tablesNeeded})</p>
//                     )}
                    
//                     <button 
//                       className="btn" 
//                       onClick={() => prepareForBooking(rest)}
//                       disabled={isFullyBooked || notEnoughTables}
//                     >
//                       {isFullyBooked || notEnoughTables ? 'Not Available' : 'Book'}
//                     </button>
//                     <button className="btn secondary" onClick={() => viewReviews(rest._id)}>
//                       View Reviews
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </section>

//       {showTimeModal && (
//         <div className="modal-backdrop" onClick={() => {
//           setShowTimeModal(null);
//           setEditBooking(null);
//         }}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <h2>{editBooking ? 'Update Booking' : 'Reserve at'} {showTimeModal.name}</h2>
//             <div className="modal-fields">
//               <label>Date
//                 <input
//                   type="date"
//                   value={modalDate}
//                   onChange={e => setModalDate(e.target.value)}
//                   className="light-input"
//                 />
//               </label>

//               <label>Select Time</label>
//               <div className="time-options">
//                 {showTimeModal.bookingTimes && showTimeModal.bookingTimes.length > 0 ? (
//                   showTimeModal.bookingTimes.map((t, i) => (
//                     <button
//                       key={i}
//                       className={`btn time-btn ${modalTime === t ? 'selected' : ''}`}
//                       onClick={() => setModalTime(t)}
//                     >
//                       {t}
//                     </button>
//                   ))
//                 ) : <p>No times available</p>}
//               </div>

//               <label>Number of People
//                 <input
//                   type="number"
//                   min="1"
//                   value={search.people}
//                   onChange={e => setSearch(s => ({ ...s, people: e.target.value }))}
//                   className="light-input"
//                 />
//               </label>

//               <div style={{ marginTop: '0.5rem', color: 'gray' }}>
//                 <p style={{ fontSize: '0.9rem' }}>
//                   Max people per table: {showTimeModal.maxPeoplePerTable}
//                 </p>
//                 <p style={{ fontSize: '0.9rem' }}>
//                   Your party requires: <strong>{requiredTables} {requiredTables > 1 ? 'tables' : 'table'}</strong>
//                 </p>
//                 <p style={{ fontSize: '0.9rem' }}>
//                   Available tables: {showTimeModal.availableTables - showTimeModal.timesBookedToday}
//                 </p>
//               </div>
//             </div>

//             <div className="modal-actions">
//               <button
//                 className="btn primary"
//                 onClick={bookTable}
//                 disabled={!modalTime || (showTimeModal.availableTables - showTimeModal.timesBookedToday < requiredTables)}
//               >
//                 Confirm
//               </button>
//               <button
//                 className="btn secondary"
//                 onClick={() => {
//                   setShowTimeModal(null);
//                   setEditBooking(null);
//                   setSnackbarMsg('❌ Booking process cancelled');
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <section className="review-section" ref={reviewsRef}>
//         {selectedRest && (
//           <div className="review-panel">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h2>Reviews for {selectedRest.name}</h2>
//               <button className="btn secondary" onClick={dismissReviews}>✖ Dismiss</button>
//             </div>
//             {reviews.length === 0 ? <p>No reviews yet.</p> : (
//               <ul className="reviews-list">
//                 {reviews.map((r, i) => (
//                   <li key={i} className={`review-item ${r.rating <= 2 ? 'low' : r.rating === 3 ? 'mid' : 'high'}`}>
//                     <div className="avatar">{r.user?.name?.charAt(0) || 'U'}</div>
//                     <div className="review-content">
//                       <div className="review-header">
//                         <strong>{r.user?.name || 'Unknown'}</strong> – ⭐ {r.rating}
//                       </div>
//                       <p>{r.comment || 'No comment'}</p>
//                       {r.user?._id === userId && (
//                         <div className="review-actions">
//                           <button className='view-booking-btn' onClick={() => {
//                             setNewReview({ rating: r.rating, comment: r.comment });
//                             setEditingReviewId(r._id);
//                           }}>Edit</button>
//                           <button className="delete" onClick={() => deleteReview(selectedRest._id, r._id)}>Delete</button>
//                         </div>
//                       )}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}

//             <div className="review-form">
//               <select name="rating" value={newReview.rating} onChange={e => setNewReview(r => ({ ...r, rating: e.target.value }))}>
//                 {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star</option>)}
//               </select>
//               <input
//                 type="text"
//                 placeholder="Write your review..."
//                 value={newReview.comment}
//                 onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))}
//               />
//               <button className="btn" onClick={() => submitReview(selectedRest._id)}>
//                 {editingReviewId ? 'Update Review' : 'Submit Review'}
//               </button>
//             </div>
//           </div>
//         )}
//       </section>

//       <section className="booking-section" ref={bookingsRef}>
//         <h2>My Bookings</h2>
//         {bookings.length === 0 ? <p>No bookings yet.</p> : (
//           <div className="booking-list">
//             {bookings.map(b => (
//               <div key={b._id} className="booking-item-flex">
//                 <div className="booking-details">
//                   📅 {new Date(b.date).toLocaleDateString()} @ {b.time} → <strong>{b.restaurant?.name || 'Unknown'}</strong>
//                   {b.numPeople && b.restaurant?.maxPeoplePerTable && (
//                     <span> • {b.numPeople} people ({Math.ceil(b.numPeople / b.restaurant.maxPeoplePerTable)} tables)</span>
//                   )}
//                 </div>
//                 <div>
//                   <button className="btn cancel" onClick={() => cancelBooking(b._id)}>Cancel</button>
//                   <button style={{marginLeft:"10px"}} className="view-booking-btn btn" onClick={() => handleEditBooking(b)}>Edit</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {snackbarMsg && <div className="snackbar">{snackbarMsg}</div>}
//     </div>
//   );
// };

// export default CustomerDashboard;






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