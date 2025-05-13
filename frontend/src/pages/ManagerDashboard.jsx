// import { useState, useEffect, useRef } from 'react';
// import axios from '../api/axiosInstance';
// import { useNavigate } from 'react-router-dom';
// import '../styles/ManagerDashboard.css';

// const ManagerDashboard = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: '', address: '', cuisine: '', cost: 1, contact: '',
//     city: '', state: '', zipCode: '', availableTables: 0,
//     bookingTimes: '', photos: '', maxPeoplePerTable: 4
//   });
//   const [restaurants, setRestaurants] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [bookings, setBookings] = useState({});
//   const [bookingOpen, setBookingOpen] = useState({});
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [loadingBookingId, setLoadingBookingId] = useState(null);
//   const [selectedBookingRestaurant, setSelectedBookingRestaurant] = useState(null);
//   const [notification, setNotification] = useState({ show: false, message: '' });
//   const bookingSectionRef = useRef(null);

//   const logout = () => {
//     localStorage.clear();
//     navigate('/login', { replace: true });
//   };

//   const fetchRestaurants = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get('/restaurant/my-listings');
//       setRestaurants(res.data);
//     } catch (err) {
//       console.error('Error fetching listings:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBookings = async (id) => {
//     if (bookingOpen[id]) {
//       setBookingOpen(prev => ({ ...prev, [id]: false }));
//       setSelectedBookingRestaurant(null);
//       return;
//     }

//     setLoadingBookingId(id);
//     try {
//       const res = await axios.get(`/restaurant/bookings/${id}`);
//       setBookings(prev => ({ ...prev, [id]: res.data }));
//       setBookingOpen(prev => ({ ...prev, [id]: true }));
//       setSelectedBookingRestaurant(id);
//       setTimeout(() => {
//         bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 100);
//     } catch (err) {
//       console.error('Error fetching bookings:', err);
//     } finally {
//       setLoadingBookingId(null);
//     }
//   };

//   const handleChange = (e) => {
//     setForm(f => ({ ...f, [e.target.name]: e.target.value }));
//   };

//   const openModal = (rest = null) => {
//     if (rest) {
//       setForm({
//         name: rest.name || '', 
//         address: rest.address || '', 
//         cuisine: rest.cuisine || '',
//         cost: rest.cost || 1, 
//         contact: rest.contact || '', 
//         city: rest.city || '',
//         state: rest.state || '', 
//         zipCode: rest.zipCode || '',
//         availableTables: rest.availableTables || 0,
//         bookingTimes: (rest.bookingTimes || []).join(','),
//         photos: (rest.photos || []).join(','),
//         maxPeoplePerTable: rest.maxPeoplePerTable || 4
//       });
//       setEditingId(rest._id);
//     } else {
//       setForm({
//         name: '', address: '', cuisine: '', cost: 1, contact: '',
//         city: '', state: '', zipCode: '', availableTables: 0,
//         bookingTimes: '', photos: '', maxPeoplePerTable: 4
//       });
//       setEditingId(null);
//     }
//     setModalOpen(true);
//   };

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     const bookingTimesArray = form.bookingTimes.split(',').map(t => t.trim()).filter(Boolean);
//     const photosArray = form.photos.split(',').map(u => u.trim()).filter(Boolean);
//     const payload = { ...form, bookingTimes: bookingTimesArray, photos: photosArray };

//     try {
//       if (editingId) {
//         await axios.put(`/restaurant/update/${editingId}`, payload);
//         showNotification('Restaurant updated!');
//       } else {
//         await axios.post('/restaurant/add', payload);
//         showNotification('Restaurant added!');
//       }
//       setForm({
//         name: '', address: '', cuisine: '', cost: 1, contact: '',
//         city: '', state: '', zipCode: '', availableTables: 0,
//         bookingTimes: '', photos: '', maxPeoplePerTable: 4
//       });
//       setEditingId(null);
//       setModalOpen(false);
//       fetchRestaurants();
//     } catch {
//       showNotification('Error saving restaurant');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this listing?')) return;
//     try {
//       await axios.delete(`/restaurant/delete/${id}`);
//       fetchRestaurants();
//       showNotification('Deleted successfully');
//     } catch {
//       showNotification('Error deleting listing');
//     }
//   };

//   const showNotification = (message) => {
//     setNotification({ show: true, message });
//     setTimeout(() => setNotification({ show: false, message: '' }), 3000);
//   };

//   useEffect(() => { fetchRestaurants(); }, []);

//   const formatDate = (dateString) => {
//     const dateObj = new Date(dateString);
//     return dateObj.toLocaleDateString(undefined, {
//       year: 'numeric', month: 'short', day: 'numeric'
//     });
//   };

//   return (
//     <div className="manager-dashboard">
//       {notification.show && (
//         <div className="modal-overlay notification-modal">
//           <div className="modal notification-box">
//             <p>{notification.message}</p>
//           </div>
//         </div>
//       )}

//       <div className="header">
//         <h1>🍽 Restaurant Manager Dashboard</h1>
//         <button className="btn logout" onClick={logout}>Logout</button>
//       </div>

//       <div className="form-section">
//         <button className="btn primary" onClick={() => openModal()}>+ Add New Restaurant</button>
//       </div>

//       <section className="listing-section">
//         <h2>My Restaurants</h2>
//         {loading ? (
//           <div className="spinner-container"><div className="spinner"></div></div>
//         ) : restaurants.length === 0 ? (
//           <p className="empty">No listings yet.</p>
//         ) : (
//           <div className="restaurant-grid">
//             {restaurants.map(rest => (
//               <div key={rest._id} className="restaurant-card">
//                 <h3>{rest.name}</h3>
//                 {rest.photos?.length > 0 && (
//                   <div className="photo-grid">
//                     {rest.photos.map((url, i) => (
//                       <img
//                         key={i}
//                         src={url}
//                         alt={`${rest.name} ${i + 1}`}
//                         onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x80?text=No+Image'; }}
//                       />
//                     ))}
//                   </div>
//                 )}
//                 <p>{rest.city} — {rest.cuisine}</p>
//                 <p>💰 Cost: {rest.cost} </p> 
//                 <p> 🍽 Tables: {rest.availableTables}</p>
//                 <div className="card-actions">
//                   <button onClick={() => openModal(rest)} className="small-btn">✏️ Edit</button>
//                   <button onClick={() => handleDelete(rest._id)} className="btn small-btn">🗑 Delete</button>
//                   <button onClick={() => fetchBookings(rest._id)} className="small-btn view-booking-btn">
//                     {bookingOpen[rest._id] ? '🔽 Hide Bookings' : '📅 View Bookings'}
//                   </button>
//                   <p>👥 Max per Table: {rest.maxPeoplePerTable}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {selectedBookingRestaurant && bookings[selectedBookingRestaurant] && (
//         <div className="booking-section" ref={bookingSectionRef}>
//           <h3>Bookings for: {restaurants.find(r => r._id === selectedBookingRestaurant)?.name}</h3>
//           {loadingBookingId === selectedBookingRestaurant ? (
//             <div className="spinner-inline"></div>
//           ) : bookings[selectedBookingRestaurant].length === 0 ? (
//             <p>No bookings yet.</p>
//           ) : (
//             <ul className="booking-list">
//               {bookings[selectedBookingRestaurant].map(b => (
//                 <li key={b._id}>📆 {formatDate(b.date)} @ {b.time} — {b.user?.name || 'Unknown'}</li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}

//       {/* Modal */}
//       {modalOpen && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h2>{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
//             <div className="restaurant-form">
//               {Object.entries(form).map(([key, val]) => (
//                 <div key={key} className="form-field">
//                   <label>
//                     {key === 'bookingTimes' ? 'Booking Times (e.g. 18:00,19:00)' :
//                       key === 'maxPeoplePerTable' ? 'Max People Per Table' :
//                       key.charAt(0).toUpperCase() + key.slice(1)}
//                   </label>
//                   <input
//                     name={key}
//                     type={['cost', 'availableTables', 'maxPeoplePerTable'].includes(key) ? 'number' : 'text'}
//                     value={form[key]}
//                     onChange={handleChange}
//                     className="light-input"
//                   />
//                 </div>
//               ))}
//               <div className="modal-actions">
//                 <button className="btn primary" onClick={handleSubmit} disabled={submitting}>
//                   {submitting ? 'Submitting...' : editingId ? 'Update' : 'Add'}
//                 </button>
//                 <button className="btn logout" onClick={() => setModalOpen(false)}>Cancel</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManagerDashboard;


import { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../styles/ManagerDashboard.css';
// Import components
import Header from './dashboard/Header';
import SearchFilters from './dashboard/SearchFilters';
import RestaurantList from './dashboard/RestaurantList';
import BookingSection from './dashboard/BookingSection';
import RestaurantModal from './dashboard/RestaurantModal';
// import Notification from './common/Notification';

// Inline Notification Component
const Notification = ({ message, type = 'success' }) => {
  return (
    <div className={`notification-modal notification-${type}`}>
      <div className="modal notification-box">
        <p>{message}</p>
      </div>
    </div>
  );
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  
  // Core state
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [viewType, setViewType] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Restaurant form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Booking state
  const [bookings, setBookings] = useState({});
  const [bookingOpen, setBookingOpen] = useState({});
  const [loadingBookingId, setLoadingBookingId] = useState(null);
  const [selectedBookingRestaurant, setSelectedBookingRestaurant] = useState(null);
  const [tabView, setTabView] = useState('all');
  
  // Statistics state
  const [statsOpen, setStatsOpen] = useState({});
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState({});
  
  const bookingSectionRef = useRef(null);

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      // Debug the API URL being used
      console.log('Fetching from:', `${axios.defaults.baseURL}/restaurant/my-listings`);
      
      const res = await axios.get('/restaurant/my-listings');
      setRestaurants(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      showNotification('Error fetching restaurants. Please check your API connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookings = async (id) => {
    if (bookingOpen[id]) {
      setBookingOpen(prev => ({ ...prev, [id]: false }));
      setSelectedBookingRestaurant(null);
      return;
    }

    setLoadingBookingId(id);
    try {
      const res = await axios.get(`/restaurant/bookings/${id}`);
      setBookings(prev => ({ ...prev, [id]: res.data }));
      setBookingOpen(prev => ({ ...prev, [id]: true }));
      setSelectedBookingRestaurant(id);
      
      setTimeout(() => {
        bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showNotification('Error loading bookings. Please try again.', 'error');
    } finally {
      setLoadingBookingId(null);
    }
  };

  // Restaurant CRUD operations
  const openModal = (restaurant = null) => {
    setEditingId(restaurant ? restaurant._id : null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/restaurant/delete/${id}`);
      fetchRestaurants();
      showNotification('Restaurant deleted successfully', 'success');
      
      // Clean up state references
      setBookingOpen(prev => {
        const newState = {...prev};
        delete newState[id];
        return newState;
      });
      
      setBookings(prev => {
        const newState = {...prev};
        delete newState[id];
        return newState;
      });
      
      setStatsOpen(prev => {
        const newState = {...prev};
        delete newState[id];
        return newState;
      });
      
      setStats(prev => {
        const newState = {...prev};
        delete newState[id];
        return newState;
      });
      
      if (selectedBookingRestaurant === id) {
        setSelectedBookingRestaurant(null);
      }
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      showNotification('Error deleting restaurant. Please try again.', 'error');
    }
  };

  const fetchStats = async (id) => {
    if (statsOpen[id]) {
      setStatsOpen(prev => ({ ...prev, [id]: false }));
      return;
    }

    setLoadingStats(prev => ({ ...prev, [id]: true }));
    try {
      const res = await axios.get(`/restaurant/stats/${id}`);
      setStats(prev => ({ ...prev, [id]: res.data }));
      setStatsOpen(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error('Error fetching statistics:', err);
      showNotification('Could not load statistics', 'error');
    } finally {
      setLoadingStats(prev => ({ ...prev, [id]: false }));
    }
  };

  const approveBooking = async (restaurantId, bookingId) => {
    try {
      await axios.put(`/restaurant/booking/${bookingId}/approve`);
      
      // Update local state
      setBookings(prev => ({
        ...prev,
        [restaurantId]: prev[restaurantId].map(b => 
          b._id === bookingId ? { ...b, status: 'approved' } : b
        )
      }));
      
      showNotification('Booking approved successfully', 'success');
      
      // Refresh stats if they're open
      if (statsOpen[restaurantId]) {
        fetchStats(restaurantId);
      }
    } catch (err) {
      console.error('Error approving booking:', err);
      showNotification('Failed to approve booking', 'error');
    }
  };

  const rejectBooking = async (restaurantId, bookingId) => {
    try {
      await axios.put(`/restaurant/booking/${bookingId}/reject`);
      
      // Update local state
      setBookings(prev => ({
        ...prev,
        [restaurantId]: prev[restaurantId].map(b => 
          b._id === bookingId ? { ...b, status: 'rejected' } : b
        )
      }));
      
      showNotification('Booking rejected', 'success');
      
      // Refresh stats if they're open
      if (statsOpen[restaurantId]) {
        fetchStats(restaurantId);
      }
    } catch (err) {
      console.error('Error rejecting booking:', err);
      showNotification('Failed to reject booking', 'error');
    }
  };

  const exportBookings = async (restaurantId) => {
    if (!bookings[restaurantId] || bookings[restaurantId].length === 0) {
      showNotification('No bookings to export', 'warning');
      return;
    }

    try {
      const response = await axios.get(`/restaurant/bookings/export/${restaurantId}`, {
        responseType: 'blob'
      });
      
      const restaurant = restaurants.find(r => r._id === restaurantId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${restaurant.name}_bookings.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Bookings exported successfully', 'success');
    } catch (err) {
      console.error('Error exporting bookings:', err);
      showNotification('Failed to export bookings', 'error');
    }
  };

  // Filter and sort functions
  const filteredRestaurants = restaurants.filter(rest => {
    const matchesSearch = 
      rest.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      rest.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rest.cuisine?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCuisine = filterCuisine === '' || rest.cuisine === filterCuisine;
    
    return matchesSearch && matchesCuisine;
  });

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get unique cuisines for filter dropdown
  const cuisines = [...new Set(restaurants.map(r => r.cuisine))].filter(Boolean);

  // Get filtered bookings based on tab
  const getFilteredBookings = (bookingsList) => {
    if (!bookingsList) return [];
    if (tabView === 'all') return bookingsList;
    
    return bookingsList.filter(booking => {
      if (tabView === 'pending') return !booking.status || booking.status === 'pending';
      return booking.status === tabView;
    });
  };

  // Load restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return (
 <div className="manager-dashboard">
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}

      <Header onLogout={logout} />

      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCuisine={filterCuisine}
        setFilterCuisine={setFilterCuisine}
        cuisines={cuisines}
        viewType={viewType}
        setViewType={setViewType}
        onAddRestaurant={() => openModal()}
      />

      <RestaurantList
        restaurants={sortedRestaurants}
        loading={loading}
        viewType={viewType}
        sortConfig={sortConfig}
        requestSort={requestSort}
        onEdit={openModal}
        onDelete={handleDelete}
        onViewBookings={fetchBookings}
        onViewStats={fetchStats}
        bookingOpen={bookingOpen}
        statsOpen={statsOpen}
        stats={stats}
        loadingStats={loadingStats}
      />

      {selectedBookingRestaurant && bookings[selectedBookingRestaurant] && (
        <BookingSection
          restaurant={restaurants.find(r => r._id === selectedBookingRestaurant)}
          bookings={getFilteredBookings(bookings[selectedBookingRestaurant])}
          loading={loadingBookingId === selectedBookingRestaurant}
          tabView={tabView}
          setTabView={setTabView}
          onExport={() => exportBookings(selectedBookingRestaurant)}
          onApprove={(bookingId) => approveBooking(selectedBookingRestaurant, bookingId)}
          onReject={(bookingId) => rejectBooking(selectedBookingRestaurant, bookingId)}
        />
      )}

      {modalOpen && (
        <RestaurantModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={fetchRestaurants}
          editingId={editingId}
          submitting={submitting}
          setSubmitting={setSubmitting}
          showNotification={showNotification}
          restaurants={restaurants}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;