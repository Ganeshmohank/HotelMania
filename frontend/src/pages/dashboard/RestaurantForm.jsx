import React from 'react';

const RestaurantForm = ({ 
  form, 
  handleChange, 
  activeTab, 
  submitting, 
  onClose,
  getCoordinatesFromAddress,
  openGoogleMaps 
}) => {
  return (
    <div className="restaurant-form">
      {activeTab === 'general' && (
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="name">Restaurant Name*</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="cuisine">Cuisine Type*</label>
              <input
                id="cuisine"
                name="cuisine"
                type="text"
                value={form.cuisine}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <h3>Location</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="address">Street Address*</label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="city">City*</label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="state">State*</label>
              <input
                id="state"
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="zipCode">Zip Code*</label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                value={form.zipCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="contact">Phone Number*</label>
              <input
                id="contact"
                name="contact"
                type="text"
                value={form.contact}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'details' && (
        <div className="form-section">
          <h3>Restaurant Details</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="cost">Price Level (1-5)</label>
              <input
                id="cost"
                name="cost"
                type="number"
                min="1"
                max="5"
                value={form.cost}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="availableTables">Available Tables</label>
              <input
                id="availableTables"
                name="availableTables"
                type="number"
                min="0"
                value={form.availableTables}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="maxPeoplePerTable">Max People Per Table</label>
              <input
                id="maxPeoplePerTable"
                name="maxPeoplePerTable"
                type="number"
                min="1"
                value={form.maxPeoplePerTable}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="bookingTimes">Booking Times (comma separated, e.g. 18:00,19:00)</label>
              <input
                id="bookingTimes"
                name="bookingTimes"
                type="text"
                value={form.bookingTimes}
                onChange={handleChange}
                placeholder="18:00,19:00,20:00,21:00"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="openingHours">Opening Hours</label>
              <input
                id="openingHours"
                name="openingHours"
                type="text"
                value={form.openingHours}
                onChange={handleChange}
                placeholder="Mon-Fri: 5PM-10PM, Sat-Sun: 4PM-11PM"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-field full-width">
              <label htmlFor="description">Restaurant Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Tell customers about your restaurant..."
              ></textarea>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-field full-width">
              <label htmlFor="specialOffers">Special Offers</label>
              <input
                id="specialOffers"
                name="specialOffers"
                type="text"
                value={form.specialOffers}
                onChange={handleChange}
                placeholder="Happy hour, discounts, special events, etc."
              />
            </div>
          </div>
        </div>
      )}
      
      {/* New Map Location Tab */}
      {activeTab === 'location' && (
        <div className="form-section">
          <h3>Google Maps Location</h3>
          <div className="info-box">
            <p>Set your restaurant's exact coordinates for Google Maps integration. Customers will be able to click a button to navigate to your restaurant.</p>
          </div>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                name="latitude"
                type="text"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 40.7128"
              />
            </div>
            <div className="form-field">
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. -74.0060"
              />
            </div>
          </div>
          
          <div className="map-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={getCoordinatesFromAddress}
              disabled={submitting}
            >
              <MapPinIcon /> Get Coordinates from Address
            </button>
            
            <button
              type="button"
              className="btn primary"
              onClick={openGoogleMaps}
              disabled={!form.latitude && !form.longitude && !form.address}
            >
              <MapIcon /> Preview on Google Maps
            </button>
          </div>
          
          <div className="help-section">
            <h4>How to find exact coordinates:</h4>
            <ol className="help-steps">
              <li>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a></li>
              <li>Search for your restaurant or navigate to its location</li>
              <li>Right-click on the exact location</li>
              <li>Select "What's here?" from the menu</li>
              <li>The coordinates will appear at the bottom of the screen</li>
              <li>Copy these numbers into the latitude and longitude fields above</li>
            </ol>
          </div>
        </div>
      )}
      
      {activeTab === 'photos' && (
        <div className="form-section">
          <h3>Restaurant Photos</h3>
          <div className="form-row">
            <div className="form-field full-width">
              <label htmlFor="photos">Photo URLs (comma separated)</label>
              <textarea
                id="photos"
                name="photos"
                value={form.photos}
                onChange={handleChange}
                rows="4"
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              ></textarea>
              <p className="help-text">
                Enter URLs for restaurant photos. Separate multiple URLs with commas.
              </p>
            </div>
          </div>
          
          {form.photos && (
            <div className="photo-preview">
              <h4>Photo Preview</h4>
              <div className="preview-grid">
                {form.photos.split(',')
                  .map(url => url.trim())
                  .filter(url => url)
                  .map((url, index) => (
                    <div key={index} className="preview-item">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x100?text=Invalid+URL';
                        }}
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="modal-actions">
        <button
          type="submit"
          className="btn primary"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : form._id ? 'Update Restaurant' : 'Add Restaurant'}
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// SVG Map Pin Icon component
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

// SVG Map Icon component
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

export default RestaurantForm;