// RestaurantTable.jsx
import React from 'react';

const RestaurantTable = ({
  restaurants,
  sortConfig,
  requestSort,
  onEdit,
  onDelete,
  onViewBookings,
  onViewStats,
  bookingOpen,
  statsOpen
}) => {
  const getCostDisplay = (cost) => {
    return Array(cost).fill('$').join('');
  };

  return (
    <div className="restaurant-list">
      <table className="restaurant-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('name')} className="sortable-header">
              Name {sortConfig.key === 'name' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => requestSort('city')} className="sortable-header">
              City {sortConfig.key === 'city' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => requestSort('cuisine')} className="sortable-header">
              Cuisine {sortConfig.key === 'cuisine' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => requestSort('availableTables')} className="sortable-header">
              Tables {sortConfig.key === 'availableTables' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => requestSort('cost')} className="sortable-header">
              Cost {sortConfig.key === 'cost' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map(rest => (
            <tr key={rest._id}>
              <td>{rest.name}</td>
              <td>{rest.city}</td>
              <td>{rest.cuisine}</td>
              <td>{rest.availableTables}</td>
              <td>{getCostDisplay(rest.cost)}</td>
              <td>
                {rest.approved ? (
                  <span className="status-badge status-approved">Approved</span>
                ) : (
                  <span className="status-badge status-pending">Pending</span>
                )}
              </td>
              <td className="table-actions">
                <button onClick={() => onEdit(rest)} className="btn-icon">✏️</button>
                <button onClick={() => onDelete(rest._id)} className="btn-icon danger">🗑</button>
                <button 
                  onClick={() => onViewBookings(rest._id)} 
                  className={`btn-icon ${bookingOpen[rest._id] ? 'active' : ''}`}
                >
                  {bookingOpen[rest._id] ? '🔽' : '📅'}
                </button>
                <button 
                  onClick={() => onViewStats(rest._id)} 
                  className={`btn-icon ${statsOpen[rest._id] ? 'active' : ''}`}
                >
                  {statsOpen[rest._id] ? '🔽' : '📊'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RestaurantTable;
