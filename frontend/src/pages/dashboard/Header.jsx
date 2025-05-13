import React from 'react';

const Header = ({ onLogout }) => {
  return (
    <div className="header">
      <h1>🍽 Restaurant Manager Dashboard</h1>
      <button className="btn logout" onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Header;