import React from 'react';

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  filterCuisine,
  setFilterCuisine,
  cuisines,
  viewType,
  setViewType,
  onAddRestaurant
}) => {
  return (
    <div className="dashboard-controls">
      <div className="search-filter-bar">
        <input 
          type="text" 
          placeholder="Search restaurants..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={filterCuisine} 
          onChange={(e) => setFilterCuisine(e.target.value)}
          className="cuisine-filter"
        >
          <option value="">All Cuisines</option>
          {cuisines.map(cuisine => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </select>
        <div className="view-toggle">
          <button 
            className={`btn-icon ${viewType === 'grid' ? 'active' : ''}`} 
            onClick={() => setViewType('grid')}
            aria-label="Grid view"
          >
            📊 Grid
          </button>
          <button 
            className={`btn-icon ${viewType === 'list' ? 'active' : ''}`} 
            onClick={() => setViewType('list')}
            aria-label="List view"
          >
            📋 List
          </button>
        </div>
      </div>
      
      <button className="btn primary add-restaurant-btn" onClick={onAddRestaurant}>
        + Add New Restaurant
      </button>
    </div>
  );
};

export default SearchFilters;

