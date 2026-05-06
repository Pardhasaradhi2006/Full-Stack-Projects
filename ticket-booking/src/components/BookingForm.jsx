import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookingForm = ({ event, availableTickets }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', department: '', tickets: 1
  });

  const handleNext = (e) => {
    e.preventDefault();
    if(formData.name && formData.email && formData.department) {
      navigate('/payment', { state: { bookingData: formData, eventData: event } });
    }
  };

  if (availableTickets === 0) {
    return (
      <div className="card" style={{ background: '#111827', border: '1px solid #374151' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Sold Out!</h2>
        <p style={{ color: '#EF4444' }}>No tickets left.</p>
      </div>
    );
  }

  // Neon Range Tracker Styling logic matching the custom image slider exactly
  const getBackgroundSize = () => {
    return { backgroundSize: `${((formData.tickets - 1) * 100) / (availableTickets > 1 ? availableTickets - 1 : 1)}% 100%` };
  };

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.1s', background: '#111827', border: '1px solid #1F2937', color: '#F8FAFC', padding: '2.5rem', borderRadius: '16px' }}>
      
      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.4rem', fontFamily: 'serif', letterSpacing: '0.5px' }}>Secure Your Seat</h2>
      <p style={{ color: '#9CA3AF', fontSize: '0.95rem', marginBottom: '2.5rem', letterSpacing: '0.3px' }}>Complete the registration form below. Tickets will be sent to your provided email address.</p>
      
      <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8' }}>Full Legal Name</label>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>👤</span>
             <input required placeholder="Enter your name as per University records" style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC', fontSize: '0.95rem' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8' }}>Institutional Email Address</label>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>✉️</span>
             <input type="email" required placeholder="student@university.edu" style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC', fontSize: '0.95rem' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8' }}>Academic Department</label>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🏢</span>
             <input required placeholder="Select Department..." style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC', fontSize: '0.95rem' }} value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#1E293B', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', marginTop: '1rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8' }}>Ticket Quantity</label>
               <div style={{ display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden' }}>
                   <button 
                       type="button" 
                       onClick={() => setFormData({...formData, tickets: Math.max(1, formData.tickets - 1)})}
                       style={{ background: '#1E293B', color: '#F8FAFC', border: 'none', padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer', outline: 'none' }}
                   >−</button>
                   <div style={{ padding: '0 1rem', fontWeight: 800, color: '#6366F1', fontSize: '1.1rem', minWidth: '3rem', textAlign: 'center' }}>
                       {formData.tickets}
                   </div>
                   <button 
                       type="button" 
                       onClick={() => setFormData({...formData, tickets: Math.min(availableTickets, formData.tickets + 1)})}
                       style={{ background: '#1E293B', color: '#F8FAFC', border: 'none', padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer', outline: 'none' }}
                   >+</button>
               </div>
           </div>
           
           <input 
              type="range" min="1" max={availableTickets} 
              style={{ width: '100%', cursor: 'pointer', accentColor: '#6366F1', appearance: 'auto', outline: 'none', marginTop: '0.5rem' }} 
              value={formData.tickets} onChange={e => setFormData({...formData, tickets: Number(e.target.value)})} 
           />
           <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>Min 1</span>
              <span>Max {availableTickets}</span>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" style={{ flex: 1, background: '#6366F1', color: 'white', padding: '1.25rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, transition: '0.2s', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
               Book ➔ 
            </button>
            <button type="button" onClick={() => setFormData({name:'',email:'',department:'',tickets:1})} style={{ background: '#1E293B', color: '#9CA3AF', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155', width: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               ↺
            </button>
        </div>

      </form>
    </div>
  );
};
export default BookingForm;
