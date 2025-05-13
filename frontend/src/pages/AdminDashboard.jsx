import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [selectedTab, setSelectedTab] = useState('restaurants');
  const [bookingStats, setBookingStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const endpoint = pendingOnly ? '/admin/pending' : '/admin/restaurants';
      const res = await axios.get(endpoint);
      setRestaurants(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
      setIsLoading(false);
    }
  };

  const approveRestaurant = async (id) => {
    try {
      setIsLoading(true);
      await axios.put(`/admin/approve/${id}`);
      fetchRestaurants();
    } catch {
      alert('Approval failed');
      setIsLoading(false);
    }
  };

  const deleteRestaurant = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this restaurant?')) {
        setIsLoading(true);
        await axios.delete(`/admin/remove/${id}`);
        fetchRestaurants();
      }
    } catch {
      alert('Delete failed');
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/admin/analytics?range=${dateRange}`);
      setAnalytics(res.data);
      
      // Process data for charts
      if (res.data) {
        // Prepare booking stats by status
        const bookingStatusCount = {
          Booked: res.data.activeBookings,
          Cancelled: res.data.cancelledBookings
        };

        // Prepare data by restaurant
        const restaurantData = res.data.bookingsByRestaurant.map(restaurant => ({
          name: restaurant.name,
          booked: restaurant.active,
          cancelled: restaurant.cancelled,
          tables: restaurant.tables
        }));

        // Prepare data by date
        const bookingsByDate = {};
        res.data.bookings.forEach(booking => {
          const date = new Date(booking.date).toLocaleDateString();
          if (!bookingsByDate[date]) {
            bookingsByDate[date] = {
              date,
              booked: 0,
              cancelled: 0
            };
          }
          
          if (booking.status === 'Booked') {
            bookingsByDate[date].booked += 1;
          } else {
            bookingsByDate[date].cancelled += 1;
          }
        });

        setBookingStats({
          statusData: [
            { name: 'Booked', value: bookingStatusCount.Booked },
            { name: 'Cancelled', value: bookingStatusCount.Cancelled }
          ],
          restaurantData: restaurantData.sort((a, b) => (b.booked + b.cancelled) - (a.booked + a.cancelled)).slice(0, 10),
          timelineData: Object.values(bookingsByDate).sort((a, b) => new Date(a.date) - new Date(b.date))
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      alert('Could not load analytics');
      setIsLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/admin/booking-history');
      setBookingHistory(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Booking history fetch error:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === 'restaurants') {
      fetchRestaurants();
    } else if (selectedTab === 'analytics') {
      fetchAnalytics();
    } else if (selectedTab === 'bookings') {
      fetchBookingHistory();
    }
  }, [selectedTab, pendingOnly, dateRange]);

  const COLORS = ['#2d6a4f', '#d00000', '#f77f00', '#1a759f', '#7209b7', '#3a0ca3'];

  return (
    <div className="admin-dashboard page">
      <header className="header">
        <h1>Admin Dashboard</h1>
        <div className="action-buttons">
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="dashboard-tabs">
        <button 
          className={`tab-btn ${selectedTab === 'restaurants' ? 'active' : ''}`} 
          onClick={() => setSelectedTab('restaurants')}
        >
          Restaurants
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'analytics' ? 'active' : ''}`} 
          onClick={() => setSelectedTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'bookings' ? 'active' : ''}`} 
          onClick={() => setSelectedTab('bookings')}
        >
          Booking History
        </button>
      </nav>

      {isLoading && <div className="loading-indicator">Loading...</div>}

      {selectedTab === 'restaurants' && (
        <div className="restaurants-section">
          <div className="section-header">
            <h2 className="section-title">
              {pendingOnly ? 'Pending Restaurants' : 'All Restaurants'}
            </h2>
            <button 
              className="btn toggle-btn" 
              onClick={() => setPendingOnly(!pendingOnly)}
            >
              {pendingOnly ? 'View All Restaurants' : 'View Pending Only'}
            </button>
          </div>

          {restaurants.length === 0 ? (
            <p className="no-items">No restaurants found.</p>
          ) : (
            <div className="restaurant-list">
              {restaurants.map(rest => (
                <div key={rest._id} className="restaurant-card">
                  {rest.photos?.[0] ? (
                    <img
                      src={rest.photos[0]}
                      alt={rest.name}
                      className="restaurant-img"
                    />
                  ) : (
                    <div className="restaurant-img placeholder">No Image</div>
                  )}

                  <div className="restaurant-info">
                    <h3>{rest.name}</h3>
                    <p className="city">{rest.city}, {rest.state} {rest.zipCode}</p>
                    <p className="cuisine">Cuisine: {rest.cuisine || 'Not specified'}</p>
                    <p className="tables">Tables: {rest.availableTables} (Max {rest.maxPeoplePerTable}/table)</p>
                    <p className="status">
                      Status:&nbsp;
                      {rest.approved
                        ? <span className="approved">✓ Approved</span>
                        : <span className="denied">✗ Pending</span>
                      }
                    </p>
                  </div>

                  <div className="restaurant-actions">
                    {!rest.approved && (
                      <button className="btn" onClick={() => approveRestaurant(rest._id)}>
                        ✓ Approve
                      </button>
                    )}
                    <button className="btn danger" onClick={() => deleteRestaurant(rest._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'analytics' && (
        <div className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">Booking Analytics</h2>
            <div className="date-range-selector">
              <button 
                className={`btn range-btn ${dateRange === 'week' ? 'active' : ''}`}
                onClick={() => setDateRange('week')}
              >
                Last Week
              </button>
              <button 
                className={`btn range-btn ${dateRange === 'month' ? 'active' : ''}`}
                onClick={() => setDateRange('month')}
              >
                Last Month
              </button>
              <button 
                className={`btn range-btn ${dateRange === 'year' ? 'active' : ''}`}
                onClick={() => setDateRange('year')}
              >
                Last Year
              </button>
            </div>
          </div>

          {!analytics ? (
            <p className="no-items">No analytics data available.</p>
          ) : (
            <div className="analytics-panel">
              <div className="analytics-summary">
                <div className="stat-card">
                  <h3>Total Bookings</h3>
                  <p className="stat-number">{analytics.totalBookings}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Bookings</h3>
                  <p className="stat-number">{analytics.activeBookings}</p>
                </div>
                <div className="stat-card">
                  <h3>Cancelled Bookings</h3>
                  <p className="stat-number">{analytics.cancelledBookings}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Tables Used</h3>
                  <p className="stat-number">{analytics.totalTablesBooked}</p>
                </div>
              </div>

              {bookingStats && (
                <div className="charts-container">
                  <div className="chart-card extra-width">
                    <h3>Booking Status</h3>
                    <div className="chart-wrapper pie-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bookingStats.statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {bookingStats.statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card extra-width">
                    <h3>Bookings by Restaurant</h3>
                    <div className="chart-wrapper bar-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={bookingStats.restaurantData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={false} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="booked" name="Active" stackId="a" fill={COLORS[0]} />
                          <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill={COLORS[1]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card full-width">
                    <h3>Booking Timeline</h3>
                    <div className="chart-wrapper line-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={bookingStats.timelineData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="booked" name="Active" stroke={COLORS[0]} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke={COLORS[1]} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              <div className="detailed-stats">
                <h3>Booking Details</h3>
                {analytics.bookings.length > 0 ? (
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Restaurant</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>People</th>
                        <th>Tables</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.bookings.map((booking, index) => (
                        <tr key={index} className={booking.status === 'Cancelled' ? 'cancelled-row' : ''}>
                          <td>{booking.restaurant?.name || 'Unknown'}</td>
                          <td>{booking.user?.name || 'Unknown'}</td>
                          <td>{new Date(booking.date).toLocaleDateString()}</td>
                          <td>{booking.time}</td>
                          <td>{booking.numPeople}</td>
                          <td>{booking.requiredTables || 1}</td>
                          <td className={booking.status === 'Booked' ? 'status-active' : 'status-cancelled'}>
                            {booking.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-items">No bookings in this time period.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'bookings' && (
        <div className="bookings-history-section">
          <h2 className="section-title">Complete Booking History</h2>
          
          {bookingHistory.length === 0 ? (
            <p className="no-items">No booking history available.</p>
          ) : (
            <div className="booking-history-panel">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Restaurant</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>People</th>
                    <th>Tables</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory.map((booking) => (
                    <tr key={booking._id} className={booking.status === 'Cancelled' ? 'cancelled-row' : ''}>
                      <td className="booking-id">{booking._id.substring(booking._id.length - 6)}</td>
                      <td>{booking.restaurant?.name || 'Unknown'}</td>
                      <td>{booking.user?.name || 'Unknown'}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>{booking.time}</td>
                      <td>{booking.numPeople}</td>
                      <td>{booking.requiredTables || 1}</td>
                      <td className={booking.status === 'Booked' ? 'status-active' : 'status-cancelled'}>
                        {booking.status}
                      </td>
                      <td>{new Date(booking.createdAt).toLocaleString()}</td>
                      <td>{new Date(booking.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;