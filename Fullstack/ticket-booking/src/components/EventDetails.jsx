import React from 'react';

const EventDetails = ({ event, availableTickets }) => {
  return (
    <div className="card animate-fade-in">
      <h2 className="section-title">Event Information</h2>
      <div className="detail-item">
        <span className="detail-label">Event Name</span>
        <span className="detail-value">{event.name}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Department</span>
        <span className="detail-value">{event.department}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Date & Time</span>
        <span className="detail-value">{event.date}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Venue</span>
        <span className="detail-value">{event.venue}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Ticket Price</span>
        <span className="detail-value">Rs. {event.price}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Available Tickets</span>
        <span className="detail-value tickets-badge">{availableTickets} remaining</span>
      </div>
    </div>
  );
};

export default EventDetails;
