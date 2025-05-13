import React from 'react';

const EmptyState = ({ onAddNew, isSearchResult = false }) => {
  if (isSearchResult) {
    return (
      <div className="empty-search">
        <p>No restaurants match your search criteria.</p>
        <button className="btn secondary" onClick={() => window.location.reload()}>
          Clear Filters
        </button>
      </div>
    );
  }
  
  return (
    <div className="empty-state">
      <p>You don't have any restaurants yet.</p>
      <button className="btn primary" onClick={onAddNew}>
        Add Your First Restaurant
      </button>
    </div>
  );
};

export default EmptyState;