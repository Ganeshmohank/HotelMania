import React from 'react';
import RestaurantStats from './RestaurantStats';

const RestaurantCard = ({
  restaurant,
  onEdit,
  onDelete,
  onViewBookings,
  onViewStats,
  bookingOpen,
  statsOpen,
  stats,
  loadingStats
}) => {
  const getCostDisplay = (cost) => {
    return Array(cost).fill('$').join('');
  };

  return (
    <>
    <div className="restaurant-card">
      <div className="card-header">
        <h3>{restaurant.name}</h3>
        {restaurant.approved ? (
          <span className="status-badge status-approved">Approved</span>
        ) : (
          <span className="status-badge status-pending">Pending</span>
        )}
      </div>
      
      {restaurant.photos?.length > 0 && (
        <div className="photo-grid">
          {restaurant.photos.slice(0, 3).map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${restaurant.name} ${i + 1}`}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x80?text=No+Image'; }}
            />
          ))}
          {restaurant.photos.length > 3 && (
            <div className="more-photos">+{restaurant.photos.length - 3}</div>
          )}
        </div>
      )}
      
      <div className="restaurant-details">
        <p className="restaurant-location">📍 {restaurant.city}, {restaurant.state}</p>
        <p className="restaurant-cuisine">🍳 {restaurant.cuisine}</p>
        <p className="restaurant-cost">💰 {getCostDisplay(restaurant.cost)}</p>
        <p className="restaurant-tables">🪑 Tables: {restaurant.availableTables}</p>
        <p className="restaurant-capacity">👥 Max per Table: {restaurant.maxPeoplePerTable || 4}</p>
        
        {restaurant.description && (
          <p className="restaurant-description">{restaurant.description}</p>
        )}
        
        {restaurant.openingHours && (
          <p className="restaurant-hours">⏰ {restaurant.openingHours}</p>
        )}
        
        {restaurant.specialOffers && (
          <p className="restaurant-offers">🏷️ {restaurant.specialOffers}</p>
        )}
      </div>
      
      <div className="card-actions">
        <button onClick={onEdit} className="btn small-btn">
          ✏️ Edit
        </button>
        <button onClick={onDelete} className="btn small-btn danger">
          🗑 Delete
        </button>
        <button 
          onClick={onViewBookings} 
          className={`btn small-btn ${bookingOpen ? 'active' : 'view-booking-btn'}`}
        >
          {bookingOpen ? '🔽 Hide Bookings' : '📅 View Bookings'}
        </button>
        <button 
          onClick={onViewStats} 
          className={`btn small-btn ${statsOpen ? 'active' : 'stats-btn'}`}
        >
          {statsOpen ? '🔽 Hide Stats' : '📊 View Stats'}
        </button>
      </div>
      
      
    </div>
    {statsOpen && (
      <RestaurantStats stats={stats} loading={loadingStats} />
    )}
    </>
  );
};

export default RestaurantCard;