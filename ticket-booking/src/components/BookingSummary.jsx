import React from 'react';

const BookingSummary = ({ summary, onReset }) => {
  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="success-container">
        
        {/* Dynamic Bouncing Ball Success Animation */}
        <div className="animate-bouncing-ball" style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            color: 'white', fontSize: '2.5rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
        }}>
          ✓
        </div>

        <h2 className="section-title" style={{ border: 'none', marginBottom: '0.5rem' }}>Payment Successful & Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-muted)' }}>We look forward to seeing you there.</p>
        
        <div className="summary-details">
          <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{summary.userName}</span></div>
          <div className="detail-item"><span className="detail-label">Event</span><span className="detail-value">{summary.eventName}</span></div>
          <div className="detail-item"><span className="detail-label">Tickets Booked</span><span className="detail-value">{summary.ticketsBooked}</span></div>
          <div className="total-amount">
            <span>Total Paid via {summary.paymentMethod || 'UPI'}</span>
            <span>${summary.totalAmount}</span>
          </div>
        </div>

        <button onClick={onReset} className="btn btn-secondary">Make Another Booking</button>
      </div>
    </div>
  );
};

export default BookingSummary;
