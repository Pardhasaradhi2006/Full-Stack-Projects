import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventDetails from '../components/EventDetails';
import BookingForm from '../components/BookingForm';
import { io } from 'socket.io-client';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
    const socket = io('http://localhost:5000');
    socket.on('event-updated', () => {
      fetchEvent();
    });
    return () => socket.disconnect();
  }, [id]);

  const fetchEvent = () => {
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => {
        const foundEvent = data.find(e => e.id === Number(id));
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          // Event not found, go home
          navigate('/');
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading Event Details...</div>;
  if (!event) return null;

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <button 
        onClick={() => navigate('/')} 
        style={{ background: 'transparent', border: 'none', color: '#6366F1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '2rem', fontSize: '1.1rem' }}
      >
        ← Back to Events
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <EventDetails event={event} availableTickets={event.availableTickets} />
        <BookingForm event={event} availableTickets={event.availableTickets} />
      </div>

    </div>
  );
};

export default BookingPage;
