import React, { useState, useEffect } from 'react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('events'); // 'events' or 'bookings'
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);

    const fetchEvents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/events');
            if(res.ok) setEvents(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/bookings');
            if(res.ok) setBookings(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchBookings();
    }, []);

    // Create Event handler
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        data.price = Number(data.price);
        data.availableTickets = Number(data.availableTickets);

        const res = await fetch('http://localhost:5000/api/events', {
            method: 'POST',
            headers:{ 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            e.target.reset();
            fetchEvents();
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
        fetchEvents();
        fetchBookings(); // refs might cascade delete
    };

    return (
        <div className="main-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1200px' }}>
            <div className="header" style={{ width: '100%', marginBottom: '1rem', padding: '1.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--primary)' }}>Admin Dashboard</h1>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button 
                        className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ width: 'auto', marginTop: 0 }}
                        onClick={() => { setActiveTab('events'); fetchEvents(); }}
                    >
                        Event Management
                    </button>
                    <button 
                        className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ width: 'auto', marginTop: 0 }}
                        onClick={() => { setActiveTab('bookings'); fetchBookings(); }}
                    >
                        Registrations & Payments
                    </button>
                </div>
            </div>

            {activeTab === 'events' && (
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', width: '100%' }}>
                    <div className="card" style={{ flex: '1', minWidth: '300px' }}>
                        <h2 className="section-title">Create New Event</h2>
                        <form onSubmit={handleCreateEvent}>
                            <div className="form-group">
                                <label className="form-label">Event Name</label>
                                <input name="name" required className="form-input" placeholder="e.g. Technical Seminar" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <input name="department" required className="form-input" placeholder="e.g. IT Department" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date & Time</label>
                                <input name="date" required className="form-input" placeholder="Friday | 10:00 AM" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Venue</label>
                                <input name="venue" required className="form-input" placeholder="e.g. Hall A" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Price ($)</label>
                                    <input name="price" type="number" min="0" required className="form-input" />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Total Tickets</label>
                                    <input name="availableTickets" type="number" min="1" required className="form-input" />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Add Event</button>
                        </form>
                    </div>

                    <div className="card" style={{ flex: '2', minWidth: '400px' }}>
                        <h2 className="section-title">Existing Events</h2>
                        {events.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No events set up yet.</p> : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Name</th>
                                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Dept</th>
                                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Price</th>
                                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Tickets Left</th>
                                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((ev) => (
                                            <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{ev.name}</td>
                                                <td style={{ padding: '0.75rem' }}>{ev.department}</td>
                                                <td style={{ padding: '0.75rem', color: 'var(--success)', fontWeight: 'bold' }}>${ev.price}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span className="tickets-badge" style={{ fontSize: '0.75rem' }}>{ev.availableTickets}</span>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <button onClick={() => handleDeleteEvent(ev.id)} style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                 <div className="card" style={{ width: '100%' }}>
                    <h2 className="section-title">Registered Users & Payments</h2>
                    {bookings.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No bookings have been made yet.</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--background)' }}>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>ID</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>User Name</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Email</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Event</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Tickets</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Amount Paid</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>#{b.id}</td>
                                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{b.userName}</td>
                                            <td style={{ padding: '0.75rem' }}>{b.email}</td>
                                            <td style={{ padding: '0.75rem' }}>{b.eventName}</td>
                                            <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{b.ticketsBooked}</td>
                                            <td style={{ padding: '0.75rem', color: 'var(--success)', fontWeight: 'bold' }}>${b.totalAmount}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{ background: '#D1FAE5', color: '#065F46', padding: '0.3rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {b.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default Admin;
