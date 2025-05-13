import React from 'react';

const RestaurantStats = ({ stats, loading }) => {
  return (
    <div className="stats-section">
      <h4>Restaurant Statistics</h4>
      {loading ? (
        <div className="spinner-inline"></div>
      ) : stats ? (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Bookings</span>
            <span className="stat-value">{stats.totalBookings || 0}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">${stats.revenue?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Popular Time</span>
            <span className="stat-value">
              {stats.popularTimes?.length > 0 
                ? stats.popularTimes[0] 
                : 'N/A'}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg. Party Size</span>
            <span className="stat-value">{stats.avgPartySize || 0}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cancellation Rate</span>
            <span className="stat-value">{stats.cancellationRate || 0}%</span>
          </div>
        </div>
      ) : (
        <p>No statistics available</p>
      )}
    </div>
  );
};

export default RestaurantStats;