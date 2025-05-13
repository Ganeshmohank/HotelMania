// BookingModal.jsx
const BookingModal = ({
    showTimeModal,
    setShowTimeModal,
    editBooking,
    setEditBooking,
    modalDate,
    setModalDate,
    modalTime,
    setModalTime,
    search,
    setSearch,
    requiredTables,
    bookTable,
    setSnackbarMsg
  }) => {
    return (
      <div className="modal-backdrop" onClick={() => {
        setShowTimeModal(null);
        setEditBooking(null);
      }}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h2>{editBooking ? 'Update Booking' : 'Reserve at'} {showTimeModal.name}</h2>
          <div className="modal-fields">
            <label>Date
              <input
                type="date"
                value={modalDate}
                onChange={e => setModalDate(e.target.value)}
                className="light-input"
              />
            </label>
            <label>Select Time</label>
            <div className="time-options">
              {showTimeModal.bookingTimes && showTimeModal.bookingTimes.length > 0 ? (
                showTimeModal.bookingTimes.map((t, i) => (
                  <button
                    key={i}
                    className={`btn time-btn ${modalTime === t ? 'selected' : ''}`}
                    onClick={() => setModalTime(t)}
                  >
                    {t}
                  </button>
                ))
              ) : <p>No times available</p>}
            </div>
            <label>Number of People
              <input
                type="number"
                min="1"
                value={search.people}
                onChange={e => setSearch(s => ({ ...s, people: e.target.value }))}
                className="light-input"
              />
            </label>
            <div className="booking-summary">
              <p>
                Max people per table: <strong>{showTimeModal.maxPeoplePerTable}</strong>
              </p>
              <p>
                Your party requires: <strong>{requiredTables} {requiredTables > 1 ? 'tables' : 'table'}</strong>
              </p>
              <p>
                Available tables: <strong>{showTimeModal.availableTables - showTimeModal.timesBookedToday}</strong>
              </p>
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="btn primary"
              onClick={bookTable}
              disabled={!modalTime || (showTimeModal.availableTables - showTimeModal.timesBookedToday < requiredTables)}
            >
              Confirm
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                setShowTimeModal(null);
                setEditBooking(null);
                setSnackbarMsg('❌ Booking process cancelled');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default BookingModal;