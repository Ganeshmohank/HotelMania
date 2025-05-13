import React from 'react';
import RestaurantCard from './RestaurantCard';
import RestaurantTable from './RestaurantTable';
import EmptyState from './EmptyState';

const RestaurantList = ({
  restaurants,
  loading,
  viewType,
  sortConfig,
  requestSort,
  onEdit,
  onDelete,
  onViewBookings,
  onViewStats,
  bookingOpen,
  statsOpen,
  stats,
  loadingStats
}) => {
  return (
    <section className="listing-section">
      <h2>My Restaurants {restaurants.length > 0 && `(${restaurants.length})`}</h2>
      
      {loading ? (
        <div className="spinner-container"><div className="spinner"></div></div>
      ) : restaurants.length === 0 ? (
        <EmptyState onAddNew={() => onEdit(null)} />
      ) : viewType === 'grid' ? (
        <div className="restaurant-grid-manager">
          {restaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              onEdit={() => onEdit(restaurant)}
              onDelete={() => onDelete(restaurant._id)}
              onViewBookings={() => onViewBookings(restaurant._id)}
              onViewStats={() => onViewStats(restaurant._id)}
              bookingOpen={bookingOpen[restaurant._id]}
              statsOpen={statsOpen[restaurant._id]}
              stats={stats[restaurant._id]}
              loadingStats={loadingStats[restaurant._id]}
            />
          ))}
        </div>
      ) : (
        <RestaurantTable
          restaurants={restaurants}
          sortConfig={sortConfig}
          requestSort={requestSort}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewBookings={onViewBookings}
          onViewStats={onViewStats}
          bookingOpen={bookingOpen}
          statsOpen={statsOpen}
        />
      )}
    </section>
  );
};

export default RestaurantList;