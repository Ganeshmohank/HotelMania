import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import RestaurantForm from './RestaurantForm';

const RestaurantModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  submitting,
  setSubmitting,
  showNotification,
  restaurants
}) => {
  const [form, setForm] = useState({
    name: '', address: '', cuisine: '', cost: 1, contact: '',
    city: '', state: '', zipCode: '', availableTables: 0,
    bookingTimes: '', photos: '', maxPeoplePerTable: 4,
    description: '', openingHours: '', specialOffers: '',
    // Add new location fields
    latitude: '',
    longitude: ''
  });
  
  const [activeTab, setActiveTab] = useState('general');
  
  // Load restaurant data if editing
  useEffect(() => {
    if (editingId) {
      const restaurant = restaurants.find(r => r._id === editingId);
      if (restaurant) {
        // Extract coordinates if they exist
        const longitude = restaurant.location?.coordinates?.[0] || '';
        const latitude = restaurant.location?.coordinates?.[1] || '';
        
        setForm({
          name: restaurant.name || '', 
          address: restaurant.address || '', 
          cuisine: restaurant.cuisine || '',
          cost: restaurant.cost || 1, 
          contact: restaurant.contact || '', 
          city: restaurant.city || '',
          state: restaurant.state || '', 
          zipCode: restaurant.zipCode || '',
          availableTables: restaurant.availableTables || 0,
          bookingTimes: (restaurant.bookingTimes || []).join(','),
          photos: (restaurant.photos || []).join(','),
          maxPeoplePerTable: restaurant.maxPeoplePerTable || 4,
          description: restaurant.description || '',
          openingHours: restaurant.openingHours || '',
          specialOffers: restaurant.specialOffers || '',
          latitude,
          longitude,
          _id: restaurant._id
        });
      }
    }
  }, [editingId, restaurants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'address', 'cuisine', 'city', 'state', 'zipCode', 'contact'];
    for (const field of requiredFields) {
      if (!form[field].trim()) {
        showNotification(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`, 'error');
        return false;
      }
    }
    
    if (form.availableTables < 0) {
      showNotification('Available tables cannot be negative', 'error');
      return false;
    }
    
    if (form.maxPeoplePerTable < 1) {
      showNotification('Max people per table must be at least 1', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    const bookingTimesArray = form.bookingTimes.split(',').map(t => t.trim()).filter(Boolean);
    const photosArray = form.photos.split(',').map(u => u.trim()).filter(Boolean);
    
    // Prepare location data
    const location = {
      type: 'Point',
      coordinates: [
        parseFloat(form.longitude) || 0,
        parseFloat(form.latitude) || 0
      ]
    };
    
    // Remove latitude/longitude from form data since we're sending location object
    const { latitude, longitude, _id, ...formData } = form;
    const payload = { 
      ...formData, 
      bookingTimes: bookingTimesArray, 
      photos: photosArray,
      location
    };

    try {
      if (editingId) {
        await axios.put(`/restaurant/update/${editingId}`, payload);
        showNotification('Restaurant updated successfully', 'success');
      } else {
        await axios.post('/restaurant/add', payload);
        showNotification('Restaurant added successfully', 'success');
      }
      
      onSubmit(); // Refresh the restaurant list
      onClose();  // Close the modal
    } catch (err) {
      console.error('Error saving restaurant:', err);
      showNotification('Error saving restaurant. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleClickOutside = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  // Function to get coordinates from address using Nominatim
  const getCoordinatesFromAddress = async () => {
    if (!form.address || !form.city || !form.state || !form.zipCode) {
      showNotification('Please fill in the address, city, state, and zip code first', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      const formattedAddress = `${form.address}, ${form.city}, ${form.state} ${form.zipCode}`;
      
      // Using Nominatim OpenStreetMap Service for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formattedAddress)}`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setForm(prev => ({
          ...prev,
          latitude: data[0].lat,
          longitude: data[0].lon
        }));
        showNotification('Location coordinates found successfully!', 'success');
      } else {
        showNotification('Could not find coordinates for this address. Try entering them manually.', 'warning');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      showNotification('Error getting coordinates. Please try again or enter them manually.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to preview the location on Google Maps
  const openGoogleMaps = () => {
    let url;
    
    if (form.latitude && form.longitude) {
      // Use coordinates if available
      url = `https://www.google.com/maps?q=${form.latitude},${form.longitude}`;
    } else if (form.address) {
      // Use address as fallback
      const formattedAddress = encodeURIComponent(
        `${form.name}, ${form.address}, ${form.city}, ${form.state} ${form.zipCode}`
      );
      url = `https://www.google.com/maps/search/?api=1&query=${formattedAddress}`;
    } else {
      showNotification('Please enter either coordinates or an address first', 'warning');
      return;
    }
    
    // Open in a new tab
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClickOutside}>
      <div className="modal">
        <div className="modal-header">
          <h2>{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="form-tabs">
          <button 
            className={`form-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Info
          </button>
          <button 
            className={`form-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Additional Details
          </button>
          <button 
            className={`form-tab ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            Map Location
          </button>
          <button 
            className={`form-tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            Photos
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <RestaurantForm 
            form={form}
            handleChange={handleChange}
            activeTab={activeTab}
            submitting={submitting}
            onClose={onClose}
            getCoordinatesFromAddress={getCoordinatesFromAddress}
            openGoogleMaps={openGoogleMaps}
          />
        </form>
      </div>
    </div>
  );
};

export default RestaurantModal;