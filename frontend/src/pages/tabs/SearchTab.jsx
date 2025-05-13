import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axiosInstance';
import fallbackImage from '../../assets/image.png';
import '../../styles/SearchTab.css'; 

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );

const SearchTab = ({ 
  search, 
  setSearch, 
  setSnackbarMsg, 
  setIsLoading,
  prepareForBooking,
  toggleFavorite,
  isRestaurantFavorite
}) => {
  const [results, setResults] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState(false);
  const pageSize = 8;
  const reviewsRef = useRef(null);
  const filtersRef = useRef(null);
  const userId = localStorage.getItem('userId');

  // Set default search values
  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Initialize search with default values if not already set
    setSearch(prevSearch => ({
      ...prevSearch,
      name: prevSearch.name || '',
      date: prevSearch.date || todayStr,
      people: prevSearch.people || 2,
      city: prevSearch.city || '',
      zip: prevSearch.zip || '',
      cuisine: prevSearch.cuisine || '',
      minRating: prevSearch.minRating || '',
      time: prevSearch.time || '',
      sortBy: prevSearch.sortBy || ''
    }));
  }, []);

  const getGoogleMapsUrl = (restaurant) => {
    // If the restaurant already has a Google Maps URL from the backend, use it
    if (restaurant.googleMapsUrl) {
      return restaurant.googleMapsUrl;
    }
    
    // Fallback: Create URL from address
    const formattedAddress = encodeURIComponent(
      `${restaurant.name}, ${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}`
    );
    return `https://www.google.com/maps/search/?api=1&query=${formattedAddress}`;
  };

  const totalPages = Math.ceil(results.length / pageSize);
  const paginatedResults = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const calculateRequiredTables = (people, maxPerTable) => {
    return Math.ceil(people / maxPerTable);
  };

  const handleChange = e => setSearch(s => ({ ...s, [e.target.name]: e.target.value }));

  const resetFilters = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    setSearch({ 
      name: '', city: '', zip: '', cuisine: '', minRating: '', 
      date: todayStr, time: '', people: 2, sortBy: '' 
    });
  };

  const toggleFilters = () => {
    setActiveFilters(!activeFilters);
    setTimeout(() => {
      if (!activeFilters && filtersRef.current) {
        filtersRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const fetchCuisines = async () => {
    try {
      const res = await axios.get('/customer/cuisines');
      setCuisines(res.data);
    } catch (err) {
      console.error('Failed to fetch cuisines:', err);
      setSnackbarMsg('❌ Could not load cuisines');
    }
  };

  const searchRestaurants = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/customer/search', { params: search });
      setResults(data);
      setCurrentPage(1);
      setIsLoading(false);
      
      if (activeFilters) {
        setActiveFilters(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Search error', err);
      setSnackbarMsg('❌ Search failed');
      setIsLoading(false);
    }
  };

  const viewReviews = async (restaurantId) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/customer/get-restaurant/${restaurantId}`);
      setSelectedRest(res.data);
      setReviews(res.data.reviews || []);
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setSnackbarMsg('❌ Could not load reviews');
      setIsLoading(false);
    }
  };

  const submitReview = async (restaurantId) => {
    if (!newReview.comment.trim()) {
      setSnackbarMsg('⚠️ Please add a comment to your review');
      return;
    }
    
    try {
      setIsLoading(true);
      if (editingReviewId) {
        await axios.put(`/customer/review/${restaurantId}/${editingReviewId}`, newReview);
        setSnackbarMsg('✅ Review updated!');
      } else {
        await axios.post(`/customer/review/${restaurantId}`, newReview);
        setSnackbarMsg('✅ Review submitted!');
      }
      setNewReview({ rating: 5, comment: '' });
      setEditingReviewId(null);
      viewReviews(restaurantId);
      setIsLoading(false);
    } catch (err) {
      setSnackbarMsg('❌ Failed to submit review');
      setIsLoading(false);
    }
  };

  const deleteReview = async (restaurantId, reviewId) => {
    try {
      setIsLoading(true);
      await axios.delete(`/customer/review/${restaurantId}/${reviewId}`);
      setSnackbarMsg('🗑️ Review deleted');
      viewReviews(restaurantId);
      setIsLoading(false);
    } catch (err) {
      console.error('Delete review failed:', err);
      setSnackbarMsg('❌ Failed to delete review');
      setIsLoading(false);
    }
  };

  const dismissReviews = () => {
    setSelectedRest(null);
    setReviews([]);
    setEditingReviewId(null);
    setNewReview({ rating: 5, comment: '' });
  };

  useEffect(() => {
    fetchCuisines();
    searchRestaurants();

    if (!search.city && !search.zip) {
      navigator.geolocation?.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || '';
          const zip = data.address.postcode || '';
          setSearch(prev => ({ ...prev, city, zip }));
        } catch (err) {
          console.error('Location fetch failed:', err);
        }
      });
    }
  }, []);

  return (
    <div className="search-tab-container">
      <div className="search-header">
        <h1>Find Your Table</h1>
        <p>Discover and book the perfect restaurant for your dining experience</p>
        <button className="toggle-filters-btn" onClick={toggleFilters}>
          {activeFilters ? 'Hide Filters' : 'Show Filters'} <span>{activeFilters ? '▲' : '▼'}</span>
        </button>
      </div>
      
      <section className={`filters-section ${activeFilters ? 'active' : ''}`} ref={filtersRef}>
        <div className="filters-grid">
          {/* Add Restaurant Name field */}
          <div className="filter-group">
            <label htmlFor="name">Restaurant Name</label>
            <input 
              id="name" 
              name="name" 
              value={search.name || ''} 
              onChange={handleChange} 
              placeholder="Search by name"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="city">City</label>
            <input id="city" name="city" value={search.city || ''} onChange={handleChange} placeholder="Enter city" />
          </div>
          
          <div className="filter-group">
            <label htmlFor="zip">Zip Code</label>
            <input id="zip" name="zip" value={search.zip || ''} onChange={handleChange} placeholder="Enter zip" />
          </div>
          
          <div className="filter-group">
            <label htmlFor="cuisine">Cuisine</label>
            <select id="cuisine" name="cuisine" value={search.cuisine || ''} onChange={handleChange}>
              <option value="">All Cuisines</option>
              {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="minRating">Minimum Rating</label>
            <select id="minRating" name="minRating" value={search.minRating || ''} onChange={handleChange}>
              <option value="">Any Rating</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>≥ {n} ⭐</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="date">Date</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              value={search.date || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="time">Time</label>
            <input type="time" id="time" name="time" value={search.time || ''} onChange={handleChange} />
          </div>
          
          <div className="filter-group">
            <label htmlFor="people">Number of People</label>
            <input 
              type="number" 
              id="people" 
              name="people" 
              min="1" 
              value={search.people || 2} 
              onChange={handleChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select id="sortBy" name="sortBy" value={search.sortBy || ''} onChange={handleChange}>
              <option value="">Default</option>
              <option value="rating">Highest Rating</option>
              <option value="cost">Cost (Low to High)</option>
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn-primary" onClick={searchRestaurants}>Search Restaurants</button>
          <button className="btn-secondary" onClick={resetFilters}>Reset Filters</button>
        </div>
      </section>
      
      <section className="results-section">
        <h2>Available Restaurants {results.length > 0 && <span>({results.length} found)</span>}</h2>
        
        {results.length === 0 ? (
          <div className="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <p>No matching restaurants found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="restaurant-grid">
              {paginatedResults.map(rest => {
                const tablesNeeded = calculateRequiredTables(parseInt(search.people || 2), rest.maxPeoplePerTable);
                const availableTables = rest.availableTables - rest.timesBookedToday;
                const isFullyBooked = availableTables <= 0;
                const notEnoughTables = availableTables < tablesNeeded;
                const isFavorite = isRestaurantFavorite(rest._id);
                
                // Calculate availability status and classes
                let availabilityStatus = 'available';
                let availabilityText = `Available: ${availableTables} tables (Your party needs ${tablesNeeded})`;
                
                if (isFullyBooked) {
                  availabilityStatus = 'booked';
                  availabilityText = 'Fully booked today';
                } else if (notEnoughTables) {
                  availabilityStatus = 'limited';
                  availabilityText = `Need ${tablesNeeded} tables, only ${availableTables} available`;
                }

                return (
                  <div key={rest._id} className={`restaurant-card ${availabilityStatus}`}>
                    <div className="restaurant-image">
                      <img
                        src={rest.photos[0] || fallbackImage}
                        alt={rest.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImage;
                        }}
                      />
                      <button
                        className={`favorite-button ${isFavorite ? 'active' : ''}`}
                        onClick={() => toggleFavorite(rest._id)}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <span>{isFavorite ? '❤️' : '🤍'}</span>
                      </button>
                      
                      {rest.reviewCount > 0 && (
                        <div className="rating-badge">
                          <span>⭐ {rest.avgRating?.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="restaurant-details">
                      <h3>{rest.name}</h3>
                      
                      <div className="restaurant-meta">
                        <span className="location">{rest.city}</span>
                        <span className="divider">•</span>
                        <span className="cuisine">{rest.cuisine}</span>
                        <span className="divider">•</span>
                        <span className="price">{'$'.repeat(rest.cost)}</span>
                      </div>
                      
                      <div className="review-count">
                        {rest.reviewCount > 0 ? `${rest.reviewCount} reviews` : 'No reviews yet'}
                      </div>
                      
                      <div className="table-info">
                        <div>
                          <span className="info-label">Tables:</span> {rest.availableTables}
                        </div>
                        <div>
                          <span className="info-label">Max/Table:</span> {rest.maxPeoplePerTable}
                        </div>
                      </div>
                      
                      <div className={`availability-status ${availabilityStatus}`}>
                        <span className="status-icon">
                          {availabilityStatus === 'available' ? '✓' : availabilityStatus === 'limited' ? '⚠️' : '✕'}
                        </span>
                        {availabilityText}
                      </div>

                      <div className="map-directions">
                        <a 
                          href={getGoogleMapsUrl(rest)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-map"
                          aria-label="View on Google Maps"
                        >
                          <MapPinIcon /> View on Map
                        </a>
                      </div>
                      
                      <div className="card-actions">
                        <button
                          className={`btn-book ${isFullyBooked || notEnoughTables ? 'disabled' : ''}`}
                          onClick={() => prepareForBooking(rest)}
                          disabled={isFullyBooked || notEnoughTables}
                        >
                          {isFullyBooked || notEnoughTables ? 'Not Available' : 'Book Now'}
                        </button>
                        <button className="btn-reviews" onClick={() => viewReviews(rest._id)}>
                          Reviews
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn prev"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <span>←</span> Previous
                </button>
                
                <div className="page-indicator">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
                
                <button
                  className="pagination-btn next"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <span>→</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>
      
      {/* Review section that shows when a restaurant is selected */}
      {selectedRest && (
        <section className="reviews-section" ref={reviewsRef}>
          <div className="reviews-container">
            <div className="reviews-header">
              <div>
                <h2>Reviews for {selectedRest.name}</h2>
                <p className="reviews-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
              </div>
              <button className="btn-close" onClick={dismissReviews} aria-label="Close reviews">
                ✖
              </button>
            </div>
            
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>Be the first to leave a review for {selectedRest.name}!</p>
              </div>
            ) : (
              <ul className="reviews-list">
                {reviews.map((review, index) => {
                  const ratingClass = review.rating <= 2 ? 'low' : review.rating === 3 ? 'medium' : 'high';
                  const isUserReview = review.user?._id === userId;
                  
                  return (
                    <li key={index} className={`review-item ${ratingClass} ${isUserReview ? 'user-review' : ''}`}>
                      <div className="review-avatar">
                        {review.user?.name?.charAt(0) || 'U'}
                      </div>
                      
                      <div className="review-content">
                        <div className="review-header">
                          <div className="review-meta">
                            <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
                            <div className="rating-stars">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {isUserReview && (
                            <div className="review-actions">
                              <button 
                                className="btn-edit" 
                                onClick={() => {
                                  setNewReview({ rating: review.rating, comment: review.comment });
                                  setEditingReviewId(review._id);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn-delete" 
                                onClick={() => deleteReview(selectedRest._id, review._id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <p className="review-text">
                          {review.comment || 'No comment provided.'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            
            <div className="add-review">
              <h3>{editingReviewId ? 'Edit Your Review' : 'Add Your Review'}</h3>
              
              <div className="rating-selector">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={i < newReview.rating ? 'star filled' : 'star'}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                      aria-label={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="rating-text">{newReview.rating} Star{newReview.rating !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="review-form">
                <textarea
                  placeholder="Share your experience..."
                  value={newReview.comment}
                  onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                ></textarea>
                
                <button 
                  className="btn-submit-review" 
                  onClick={() => submitReview(selectedRest._id)}
                  disabled={!newReview.comment.trim()}
                >
                  {editingReviewId ? 'Update Review' : 'Submit Review'}
                </button>
                
                {editingReviewId && (
                  <button 
                    className="btn-cancel" 
                    onClick={() => {
                      setEditingReviewId(null);
                      setNewReview({ rating: 5, comment: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchTab;