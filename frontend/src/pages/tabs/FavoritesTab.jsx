// FavoritesTab.jsx - Enhanced version
import { useState } from 'react';
import fallbackImage from '../../assets/image.png';
import "../../styles/Favorites.css"
const FavoritesTab = ({ 
  favorites, 
  toggleFavorite, 
  setActiveTab, 
  setSearch,
  prepareForBooking 
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleBooking = (restaurant) => {
    setActiveTab('search');
    setSearch(prev => ({ ...prev, city: restaurant.city }));
    setTimeout(() => prepareForBooking(restaurant), 100);
  };

  // Function to generate cost symbols ($ to $$$$)
  const renderCost = (cost) => {
    return '💰'.repeat(cost);
  };

  // Function to format rating with stars
  const formatRating = (rating) => {
    if (!rating) return 'Not rated';
    return `${rating.toFixed(1)} ⭐`;
  };

  return (
    <section className="favorites-section">
      <div className="favorites-header">
        <h2>My Favorite Restaurants</h2>
        <p className="favorites-subtitle">Discover and book your favorite dining spots</p>
      </div>
      
      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">💔</div>
          <h3>No favorites yet</h3>
          <p>Explore restaurants and add them to your favorites!</p>
          <button 
            className="explore-btn"
            onClick={() => setActiveTab('search')}
          >
            Explore Restaurants
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(rest => (
            <div 
              key={rest._id} 
              className="favorite-card"
              onMouseEnter={() => setHoveredCard(rest._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="card-image">
                <img
                  src={rest.photos && rest.photos.length > 0 ? rest.photos[0] : fallbackImage}
                  alt={rest.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImage;
                  }}
                />
                <div className="card-overlay">
                  <button 
                    className="favorite-btn"
                    onClick={() => toggleFavorite(rest._id)}
                    aria-label="Remove from favorites"
                  >
                    <span>❤️</span>
                  </button>
                </div>
              </div>
              
              <div className="card-content">
                <h3 className="restaurant-name">{rest.name}</h3>
                
                <div className="restaurant-details">
                  <span className="restaurant-cuisine">{rest.cuisine}</span>
                  <span className="restaurant-location">{rest.city}</span>
                </div>
                
                <div className="restaurant-stats">
                  <div className="stat">
                    <span className="stat-label">Cost:</span>
                    <span className="stat-value">{renderCost(rest.cost)}</span>
                  </div>
                  
                  <div className="stat">
                    <span className="stat-label">Rating:</span>
                    <span className="stat-value">
                      {formatRating(rest.avgRating)}
                      {rest.reviewCount > 0 && 
                        <span className="review-count">({rest.reviewCount})</span>
                      }
                    </span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    className="book-btn"
                    onClick={() => handleBooking(rest)}
                  >
                    Book a Table
                  </button>
                  
                  <button 
                    className="reviews-btn"
                    onClick={() => {
                      setActiveTab('search');
                      setTimeout(() => {
                        const event = new CustomEvent('viewRestaurantReviews', { detail: rest._id });
                        document.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FavoritesTab;