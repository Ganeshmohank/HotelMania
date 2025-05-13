import React, { useState } from 'react';
import { format } from 'date-fns';

const ConsolidatedBookings = ({ 
  bookings, 
  loading, 
  restaurants, 
  filter,
  setFilter,
  onApprove,
  onReject,
  onExport
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  const [expandedBooking, setExpandedBooking] = useState(null);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Special case for nested properties
    if (sortConfig.key === 'restaurant.name') {
      aValue = a.restaurant?.name || '';
      bValue = b.restaurant?.name || '';
    } else if (sortConfig.key === 'user.name') {
      aValue = a.user?.name || '';
      bValue = b.user?.name || '';
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  // Status badge color mapping
  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      case 'pending': default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const toggleExpandBooking = (id) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  return (
    <div className="consolidated-bookings">
      <div className="consolidated-header">
        <h2>All Bookings</h2>
        <button onClick={onExport} className="btn btn-export" disabled={bookings.length === 0}>
          <i className="fas fa-file-export"></i> Export
        </button>
      </div>
      
      <div className="consolidated-filters">
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select 
            id="status" 
            name="status" 
            value={filter.status} 
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="restaurant">Restaurant:</label>
          <select 
            id="restaurant" 
            name="restaurant" 
            value={filter.restaurant} 
            onChange={handleFilterChange}
          >
            <option value="">All Restaurants</option>
            {restaurants.map(restaurant => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="startDate">From:</label>
          <input 
            type="date" 
            id="startDate" 
            name="startDate"
            value={filter.startDate} 
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="endDate">To:</label>
          <input 
            type="date" 
            id="endDate" 
            name="endDate"
            value={filter.endDate} 
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found matching your criteria.</p>
        </div>
      ) : (
        <div className="consolidated-table-container">
          <table className="consolidated-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('restaurant.name')} className={sortConfig.key === 'restaurant.name' ? `sorted-${sortConfig.direction}` : ''}>
                  Restaurant <i className="fas fa-sort"></i>
                </th>
                <th onClick={() => handleSort('user.name')} className={sortConfig.key === 'user.name' ? `sorted-${sortConfig.direction}` : ''}>
                  Customer <i className="fas fa-sort"></i>
                </th>
                <th onClick={() => handleSort('date')} className={sortConfig.key === 'date' ? `sorted-${sortConfig.direction}` : ''}>
                  Date <i className="fas fa-sort"></i>
                </th>
                <th onClick={() => handleSort('time')} className={sortConfig.key === 'time' ? `sorted-${sortConfig.direction}` : ''}>
                  Time <i className="fas fa-sort"></i>
                </th>
                <th onClick={() => handleSort('partySize')} className={sortConfig.key === 'partySize' ? `sorted-${sortConfig.direction}` : ''}>
                  Party <i className="fas fa-sort"></i>
                </th>
                <th onClick={() => handleSort('status')} className={sortConfig.key === 'status' ? `sorted-${sortConfig.direction}` : ''}>
                  Status <i className="fas fa-sort"></i>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBookings.map(booking => (
                <React.Fragment key={booking._id}>
                  <tr 
                    className={expandedBooking === booking._id ? 'expanded-row' : ''}
                    onClick={() => toggleExpandBooking(booking._id)}
                  >
                    <td>{booking.restaurant?.name || 'Unknown'}</td>
                    <td>{booking.user?.name || 'Unknown'}</td>
                    <td>{formatDate(booking.date)}</td>
                    <td>{booking.time}</td>
                    <td>{booking.partySize}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(booking.status)}`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove(booking._id, booking.restaurant._id);
                            }}
                            className="btn btn-approve"
                            title="Approve"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onReject(booking._id, booking.restaurant._id);
                            }}
                            className="btn btn-reject"
                            title="Reject"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandBooking(booking._id);
                        }}
                        className="btn btn-expand"
                        title={expandedBooking === booking._id ? "Show Less" : "Show More"}
                      >
                        <i className={`fas fa-chevron-${expandedBooking === booking._id ? 'up' : 'down'}`}></i>
                      </button>
                    </td>
                  </tr>
                  {expandedBooking === booking._id && (
                    <tr className="booking-details-row">
                      <td colSpan="7">
                        <div className="booking-details">
                          <div className="booking-detail-group">
                            <label>Confirmation Code:</label>
                            <span>{booking.confirmationCode || 'N/A'}</span>
                          </div>
                          <div className="booking-detail-group">
                            <label>Contact Phone:</label>
                            <span>{booking.contactPhone || 'N/A'}</span>
                          </div>
                          <div className="booking-detail-group">
                            <label>Contact Email:</label>
                            <span>{booking.contactEmail || booking.user?.email || 'N/A'}</span>
                          </div>
                          <div className="booking-detail-group">
                            <label>Table Number:</label>
                            <span>{booking.tableNumber || 'Not assigned'}</span>
                          </div>
                          <div className="booking-detail-group special-requests">
                            <label>Special Requests:</label>
                            <span>{booking.specialRequests || 'None'}</span>
                          </div>
                          {booking.statusHistory && booking.statusHistory.length > 0 && (
                            <div className="booking-detail-group history">
                              <label>Status History:</label>
                              <ul className="status-history-list">
                                {booking.statusHistory.map((entry, index) => (
                                  <li key={index}>
                                    <span className={`status-badge ${getStatusClass(entry.status)}`}>
                                      {entry.status}
                                    </span>
                                    <span className="history-date">
                                      {format(new Date(entry.updatedAt), 'MMM dd, yyyy HH:mm')}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedBookings;