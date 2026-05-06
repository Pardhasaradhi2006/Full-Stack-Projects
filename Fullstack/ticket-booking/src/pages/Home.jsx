import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const Home = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    const socket = io('http://localhost:5000');
    socket.on('event-updated', () => {
      console.log('Real-time sync: fetching updated events...');
      fetchEvents();
    });
    return () => socket.disconnect();
  }, []);

  const fetchEvents = () => {
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
      })
      .catch(e => console.error(e));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Immersive Hero Section replacing old text */}
      <div className="animate-fade-in" style={{ 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.8) 0%, rgba(99, 102, 241, 0.8) 100%)', 
          backdropFilter: 'blur(10px)',
          color: 'white', padding: '5rem 2rem 7rem', textAlign: 'center', 
          borderRadius: '0 0 40px 40px', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.2)',
          marginTop: '-2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' 
      }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>Welcome to Campus Events.</h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>Discover top-tier tech symposiums, cultural fests, and academic seminars securely directly from your dedicated institutional portal.</p>
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '-4rem auto 4rem', padding: '0 1rem' }}>
        <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', textAlign: 'center', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>Available Events</h2>
        
        {events.length === 0 ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', fontSize: '1.2rem' }}>Loading active events...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {events.map((e) => {
              const parsedDate = new Date(e.date);
              const dateString = isNaN(parsedDate) ? e.date : parsedDate.toLocaleDateString();
              
              return (
              <div key={e.id} className="card animate-fade-in" style={{ 
                background: '#151A2A', border: '1px solid #1E293B', borderRadius: '16px', padding: '2rem',
                display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
              }}
              onMouseEnter={(el) => {
                el.currentTarget.style.transform = 'translateY(-8px)';
                el.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(el) => {
                el.currentTarget.style.transform = 'none';
                el.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
              }}
              onClick={() => navigate(`/book/${e.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{e.name}</h3>
                  <span style={{ background: '#312E81', color: '#818CF8', padding: '0.35rem 0.85rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{e.department}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94A3B8', fontSize: '0.95rem', fontWeight: 500 }}>
                    <span style={{ background: '#1E293B', padding: '0.5rem', borderRadius: '8px' }}>📅</span> {dateString}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94A3B8', fontSize: '0.95rem', fontWeight: 500 }}>
                    <span style={{ background: '#1E293B', padding: '0.5rem', borderRadius: '8px' }}>📍</span> {e.venue}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #1E293B' }}>
                  <div style={{ color: '#F8FAFC', fontWeight: 900, fontSize: '1.3rem' }}>
                    Rs. {Number(e.price).toFixed(2)}
                  </div>
                  <div style={{ 
                    background: e.availableTickets > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: e.availableTickets > 0 ? '#34D399' : '#FCA5A5', 
                    padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800,
                    border: `1px solid ${e.availableTickets > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {e.availableTickets > 0 ? `${e.availableTickets} left` : 'Sold Out'}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
