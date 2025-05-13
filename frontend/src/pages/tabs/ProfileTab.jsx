// Updated ProfileTab.jsx with debugging and fixed active bookings count
import { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const ProfileTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  
  // User profile state
  const userName = localStorage.getItem('name') || 'User';
  const userEmail = localStorage.getItem('email') || '';
  const [profile, setProfile] = useState({
    name: userName,
    email: userEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Stats states
  const [activeBookings, setActiveBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  
  // UI state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);
  
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch each data type individually with logging for debugging
      const profileRes = await axios.get('/customer/profile');
      console.log('Profile data:', profileRes.data);
      
      const bookingsRes = await axios.get('/customer/getActiveBookings');
      console.log('Active bookings:', bookingsRes.data);
      
      const historyRes = await axios.get('/customer/booking-history');
      console.log('Booking history:', historyRes.data);
      
      const reviewsRes = await axios.get('/customer/my-reviews');
      console.log('User reviews:', reviewsRes.data);
      
      const favoritesRes = await axios.get('/customer/favorites');
      console.log('Favorites:', favoritesRes.data);
      
      // Update profile data
      setProfile(prev => ({
        ...prev,
        name: profileRes.data.name || userName,
        email: profileRes.data.email || userEmail
      }));
      
      // Update stats - ensure we're working with arrays
      setActiveBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setBookingHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      setUserReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      setFavoriteRestaurants(Array.isArray(favoritesRes.data) ? favoritesRes.data : []);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setSnackbarMsg('❌ Failed to load profile data');
      setIsLoading(false);
    }
  };
  
  // Function to manually reload data
  const refreshData = () => {
    setSnackbarMsg('Refreshing data...');
    fetchAllData().then(() => {
      setSnackbarMsg('✅ Data refreshed successfully!');
      setTimeout(() => setSnackbarMsg(''), 3000);
    });
  };
  
  const handleProfileChange = e => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const updateProfile = async () => {
    // Validate form
    if (!profile.name.trim()) {
      setSnackbarMsg('⚠️ Name cannot be empty');
      return;
    }
    
    // If changing password, validate password fields
    if (profile.newPassword) {
      if (!profile.currentPassword) {
        setSnackbarMsg('⚠️ Current password is required');
        return;
      }
      if (profile.newPassword !== profile.confirmPassword) {
        setSnackbarMsg('⚠️ New passwords do not match');
        return;
      }
      if (profile.newPassword.length < 6) {
        setSnackbarMsg('⚠️ Password must be at least 6 characters');
        return;
      }
    }
    
    try {
      setIsLoading(true);
      const { data } = await axios.put('/customer/update-profile', {
        name: profile.name,
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword
      });
      
      // Update localStorage with new name
      localStorage.setItem('name', profile.name);
      
      // Reset password fields
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setIsEditingProfile(false);
      setSnackbarMsg('✅ Profile updated successfully!');
      setIsLoading(false);
    } catch (err) {
      console.error('Update profile error:', err);
      setSnackbarMsg(err.response?.data?.message || '❌ Failed to update profile');
      setIsLoading(false);
    }
  };
  
  return (
    <section className="tab-content profile-section">
      <h2>My Profile</h2>
      
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h3>{profile.name}</h3>
              <p>{profile.email}</p>
            </div>
            {!isEditingProfile && (
              <button 
                className="btn edit-profile" 
                onClick={() => setIsEditingProfile(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {isEditingProfile ? (
            <div className="profile-edit-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="disabled-input"
                />
                <p className="help-text">Email cannot be changed</p>
              </div>
              
              <div className="password-section">
                <h4>Change Password</h4>
                
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={profile.currentPassword}
                    onChange={handleProfileChange}
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={profile.newPassword}
                    onChange={handleProfileChange}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={profile.confirmPassword}
                    onChange={handleProfileChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn" 
                  onClick={updateProfile}
                >
                  Save Changes
                </button>
                <button 
                  className="btn secondary" 
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfile(prev => ({
                      ...prev,
                      name: userName,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }));
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-stats">
                <div className="stat-item">
                  <h4>Active Bookings</h4>
                  <p className="stat-value">{activeBookings.length}</p>
                </div>
                <div className="stat-item">
                  <h4>Total Bookings</h4>
                  <p className="stat-value">{bookingHistory.length}</p>
                </div>
                <div className="stat-item">
                  <h4>Total Reviews</h4>
                  <p className="stat-value">{userReviews.length}</p>
                </div>
                <div className="stat-item">
                  <h4>Favorite Restaurants</h4>
                  <p className="stat-value">{favoriteRestaurants.length}</p>
                </div>
              </div>
              
              <div className="stats-debug">
                <button 
                  className="btn refresh-btn"
                  onClick={refreshData}
                >
                  Refresh Data
                </button>
              </div>
            </>
          )}
        </div>
      )}
      
      {snackbarMsg && (
        <div className="snackbar">
          {snackbarMsg}
          <button 
            className="close-snackbar"
            onClick={() => setSnackbarMsg('')}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
};

export default ProfileTab;