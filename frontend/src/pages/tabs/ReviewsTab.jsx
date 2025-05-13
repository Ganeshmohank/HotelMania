// ReviewsTab.jsx - Enhanced UI with Improved Structure and Features
import { useState } from 'react';
import axios from '../../api/axiosInstance';
import fallbackImage from '../../assets/image.png';
import '../../styles/ReviewsTab.css';

const ReviewsTab = ({ myReviews, setSnackbarMsg, setIsLoading, setMyReviews }) => {
  const [editReview, setEditReview] = useState({ rating: 5, comment: '' });
  const [editingId, setEditingId] = useState(null);
  const [filterRating, setFilterRating] = useState(0); // 0 = all ratings
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'highest', 'lowest'
  const [expandedReviews, setExpandedReviews] = useState({});

  const handleEdit = (review) => {
    setEditReview({
      rating: review.rating,
      comment: review.comment
    });
    setEditingId(review._id);
  };

  const handleChange = (e) => {
    setEditReview(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const submitUpdate = async (restaurantId) => {
    try {
      setIsLoading(true);
      await axios.put(`/customer/review/${restaurantId}/${editingId}`, editReview);
      setSnackbarMsg('✅ Review updated successfully');
      setEditingId(null);
      
      // Refresh reviews
      const { data } = await axios.get('/customer/my-reviews');
      setMyReviews(data);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Update review error:', err);
      setSnackbarMsg('❌ Failed to update review');
      setIsLoading(false);
    }
  };

  const deleteReview = async (restaurantId, reviewId) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.delete(`/customer/review/${restaurantId}/${reviewId}`);
      setSnackbarMsg('🗑️ Review deleted successfully');
      
      // Refresh reviews
      const { data } = await axios.get('/customer/my-reviews');
      setMyReviews(data);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Delete review failed:', err);
      setSnackbarMsg('❌ Failed to delete review');
      setIsLoading(false);
    }
  };

  // Toggle expanded/collapsed state of a review
  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Helper to render star rating
  const renderStarRating = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
        {i < rating ? '★' : '☆'}
      </span>
    ));
  };

  // Format the date nicely
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Calculate time since review was posted
  const getTimeAgo = (dateString) => {
    try {
      const now = new Date();
      const reviewDate = new Date(dateString);
      const diffInMs = now - reviewDate;
      
      const diffInSecs = Math.floor(diffInMs / 1000);
      const diffInMins = Math.floor(diffInSecs / 60);
      const diffInHours = Math.floor(diffInMins / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInDays / 365);
      
      if (diffInYears > 0) {
        return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
      } else if (diffInMonths > 0) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
      } else if (diffInDays > 0) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
      } else if (diffInHours > 0) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInMins > 0) {
        return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        return 'Just now';
      }
    } catch (e) {
      return 'Unknown time';
    }
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = [...myReviews]
    .filter(review => filterRating === 0 || review.rating === filterRating)
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === 'highest') {
        return b.rating - a.rating;
      } else if (sortOrder === 'lowest') {
        return a.rating - b.rating;
      }
      return 0;
    });

  // Get review count by rating
  const reviewsByRating = myReviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  // Calculate average rating
  const averageRating = myReviews.length > 0 
    ? (myReviews.reduce((sum, review) => sum + review.rating, 0) / myReviews.length).toFixed(1) 
    : '0.0';

  return (
    <section className="reviews-tab-section">
      <header className="reviews-header">
        <div className="reviews-title">
          <h2>My Restaurant Reviews</h2>
          <span className="reviews-count">{myReviews.length} review{myReviews.length !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="reviews-stats">
          <div className="stat-card">
            <div className="stat-value">{myReviews.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          
          <div className="stat-card highlight">
            <div className="stat-value">
              {averageRating}
              <span className="stat-star">★</span>
            </div>
            <div className="stat-label">Average Rating</div>
          </div>
          
          {myReviews.length > 0 && (
            <div className="stat-card">
              <div className="stat-value">
                {myReviews.reduce((count, review) => review.rating === 5 ? count + 1 : count, 0)}
              </div>
              <div className="stat-label">5-Star Reviews</div>
            </div>
          )}
        </div>
      </header>
      
      <div className="reviews-controls">
        <div className="rating-filter">
          <div className="filter-label">Filter by:</div>
          <div className="rating-buttons">
            <button 
              className={`rating-btn ${filterRating === 0 ? 'active' : ''}`} 
              onClick={() => setFilterRating(0)}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map(rating => (
              <button 
                key={rating}
                className={`rating-btn ${filterRating === rating ? 'active' : ''}`}
                onClick={() => setFilterRating(rating)}
              >
                {rating} ★ 
                <span className="rating-count">({reviewsByRating[rating] || 0})</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="sort-control">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>
      
      {myReviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>You haven't written any restaurant reviews yet.</p>
          <button 
            className="btn primary"
            onClick={() => document.querySelector('[data-tab="search"]').click()}
          >
            Find Restaurants to Review
          </button>
        </div>
      ) : filteredAndSortedReviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matching reviews</h3>
          <p>No reviews match your current filter. Try adjusting your filters.</p>
          <button 
            className="btn secondary"
            onClick={() => setFilterRating(0)}
          >
            Show All Reviews
          </button>
        </div>
      ) : (
        <div className="reviews-grid">
          {filteredAndSortedReviews.map(review => (
            <div key={review._id} className={`review-card rating-${review.rating}`}>
              {editingId === review._id ? (
                <div className="review-edit-form">
                  <h3 className="edit-form-title">Edit Your Review</h3>
                  <p className="edit-restaurant-name">{review.restaurant?.name || 'Unknown Restaurant'}</p>
                  
                  <div className="edit-rating-field">
                    <label>Your Rating:</label>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= editReview.rating ? 'selected' : ''}`}
                          onClick={() => setEditReview(prev => ({ ...prev, rating: star }))}
                          aria-label={`Rate ${star} stars`}
                        >
                          {star <= editReview.rating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="edit-comment-field">
                    <label htmlFor="review-comment">Your Review:</label>
                    <textarea
                      id="review-comment"
                      name="comment"
                      value={editReview.comment}
                      onChange={handleChange}
                      placeholder="Share your experience at this restaurant..."
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="btn primary" 
                      onClick={() => submitUpdate(review.restaurant._id)}
                    >
                      Save Changes
                    </button>
                    <button 
                      className="btn secondary" 
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="review-card-header">
                    <div className="review-restaurant-info">
                      <img 
                        className="restaurant-thumbnail" 
                        src={review.restaurant?.photos?.[0] || fallbackImage} 
                        alt={review.restaurant?.name}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = fallbackImage; 
                        }}
                      />
                      <div className="restaurant-details">
                        <h3>{review.restaurant?.name || 'Unknown Restaurant'}</h3>
                        <p className="restaurant-cuisine">{review.restaurant?.cuisine || ''}</p>
                      </div>
                    </div>
                    
                    <div className="rating-display">
                      <div className="rating-badge-lg">
                        {review.rating}<span className="star-symbol">★</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="review-card-body">
                    <div className="review-content">
                      <div className="star-rating-display">
                        {renderStarRating(review.rating)}
                      </div>
                      
                      <p className={`review-comment ${expandedReviews[review._id] ? 'expanded' : ''}`}>
                        {review.comment || 'No comment provided.'}
                      </p>
                      
                      {review.comment && review.comment.length > 150 && (
                        <button 
                          className="expand-btn"
                          onClick={() => toggleReviewExpansion(review._id)}
                        >
                          {expandedReviews[review._id] ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </div>
                    
                    <div className="review-meta">
                      <span className="review-date-full">{formatDate(review.createdAt)}</span>
                      <span className="review-date-relative">{getTimeAgo(review.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="review-card-actions">
                    <button 
                      className="btn edit-btn" 
                      onClick={() => handleEdit(review)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button 
                      className="btn delete-btn" 
                      onClick={() => deleteReview(review.restaurant._id, review._id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewsTab;