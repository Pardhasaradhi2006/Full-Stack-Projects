import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [newEvent, setNewEvent] = useState({ name: '', department: '', date: '', venue: '', price: 0, availableTickets: 50 });
    const [editingEventId, setEditingEventId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'Admin') { navigate('/'); return; }
        fetchData();
        const socket = io('http://localhost:5000');
        socket.on('event-updated', fetchData);
        return () => socket.disconnect();
    }, [user]);

    const fetchData = async () => {
        try {
            const [uRes, bRes, eRes] = await Promise.all([
                fetch('http://localhost:5000/api/users'),
                fetch('http://localhost:5000/api/bookings'),
                fetch('http://localhost:5000/api/events')
            ]);
            setUsers(await uRes.json());
            setBookings(await bRes.json());
            setEvents(await eRes.json());
        } catch (e) { console.error(e); }
    };

    const handleRole = async (userId, role) => {
        if (!window.confirm(`Set this user's role to ${role}?`)) return;
        await fetch(`http://localhost:5000/api/users/${userId}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
        fetchData();
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Permanently delete this user?')) return;
        await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE' });
        fetchData();
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        await fetch('http://localhost:5000/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEvent) });
        fetchData();
        setNewEvent({ name: '', department: '', date: '', venue: '', price: 0, availableTickets: 50 });
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handleEditClick = (event) => { setEditingEventId(event.id); setEditFormData({ ...event }); };

    const handleUpdateEvent = async (id) => {
        await fetch(`http://localhost:5000/api/events/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editFormData) });
        setEditingEventId(null);
        fetchData();
    };

    if (!user || user.role !== 'Admin') return null;

    const totalTickets = bookings.reduce((sum, b) => sum + b.ticketsBooked, 0);
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Styles
    const S = {
        page: { minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
        topbar: { background: '#1E293B', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
        logo: { color: '#F59E0B', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.5px' },
        adminBadge: { background: '#334155', color: '#94A3B8', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginRight: '0.75rem' },
        userText: { color: 'white', fontWeight: 700, marginRight: '0.75rem', fontSize: '0.95rem' },
        signOutBtn: { background: 'transparent', border: '1px solid #475569', color: '#94A3B8', padding: '0.35rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
        sidebar: { width: '200px', background: '#1E293B', minHeight: 'calc(100vh - 56px)', padding: '1.5rem 0', flexShrink: 0 },
        sideItem: (active) => ({ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', cursor: 'pointer', color: active ? '#F8FAFC' : '#94A3B8', background: active ? '#334155' : 'transparent', borderLeft: active ? '3px solid #F59E0B' : '3px solid transparent', fontWeight: active ? 700 : 500, fontSize: '0.9rem', transition: 'all 0.15s' }),
        content: { flex: 1, padding: '2rem', overflow: 'auto' },
        pageTitle: { fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' },
        pageSubtitle: { color: '#64748B', fontSize: '0.9rem', marginBottom: '2rem' },
        metricCard: (color) => ({ background: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `4px solid ${color}`, flex: 1, minWidth: '180px' }),
        metricLabel: { color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' },
        metricValue: { fontSize: '2rem', fontWeight: 900, color: '#0F172A' },
        card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
        sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem' },
        activityItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #F1F5F9' },
        dot: (color) => ({ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }),
        quickBtn: { display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.85rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#0F172A', fontSize: '0.9rem', marginBottom: '0.75rem', transition: 'background 0.15s' },
        tableHead: { background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' },
        th: { padding: '0.85rem 1rem', color: '#64748B', fontWeight: 600, fontSize: '0.85rem', textAlign: 'left' },
        td: { padding: '0.85rem 1rem', borderBottom: '1px solid #F8FAFC', color: '#1E293B', fontSize: '0.9rem' },
    };

    const SidebarItem = ({ icon, label, tab }) => (
        <div style={S.sideItem(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            <span>{icon}</span> {label}
        </div>
    );

    return (
        <div style={S.page}>
            {/* Top Bar */}
            <div style={S.topbar}>
                <span style={S.logo}>🎟 CampusEvents Admin</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={S.adminBadge}>ADMINISTRATOR</span>
                    <span style={S.userText}>{user?.username}</span>
                    <button style={S.signOutBtn} onClick={() => { logout?.(); navigate('/login'); }}>Sign Out</button>
                </div>
            </div>

            <div style={{ display: 'flex' }}>
                {/* Sidebar */}
                <div style={S.sidebar}>
                    <SidebarItem icon="📊" label="Overview" tab="overview" />
                    <SidebarItem icon="📋" label="Bookings" tab="bookings" />
                    <SidebarItem icon="👥" label="Users" tab="users" />
                    <SidebarItem icon="🎫" label="Events" tab="events" />
                </div>

                {/* Main Content */}
                <div style={S.content}>

                    {/* ── OVERVIEW TAB ── */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            <div style={S.pageTitle}>System Overview</div>
                            <div style={S.pageSubtitle}>Real-time performance metrics and management</div>

                            {/* Metric Cards */}
                            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                <div style={S.metricCard('#6366F1')}>
                                    <div style={S.metricLabel}>👤 Total Users</div>
                                    <div style={S.metricValue}>{users.length}</div>
                                </div>
                                <div style={S.metricCard('#F59E0B')}>
                                    <div style={S.metricLabel}>🎫 Tickets Sold</div>
                                    <div style={S.metricValue}>{totalTickets}</div>
                                </div>
                                <div style={S.metricCard('#10B981')}>
                                    <div style={S.metricLabel}>💰 Total Revenue</div>
                                    <div style={S.metricValue}>₹{totalRevenue.toFixed(2)}</div>
                                </div>
                                <div style={S.metricCard('#3B82F6')}>
                                    <div style={S.metricLabel}>📅 Active Events</div>
                                    <div style={S.metricValue}>{events.length}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
                                {/* Recent Activity */}
                                <div style={S.card}>
                                    <div style={S.sectionTitle}>Recent Activity</div>
                                    {bookings.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No bookings yet.</p>}
                                    {bookings.slice(0, 6).map((b, i) => (
                                        <div key={b.id || i} style={S.activityItem}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={S.dot('#10B981')} />
                                                <span style={{ fontSize: '0.875rem', color: '#0F172A' }}>
                                                    New booking: <strong>{b.userName}</strong>
                                                    <span style={{ color: '#94A3B8' }}> (BK-{String(b.id).padStart(4,'0')})</span>
                                                </span>
                                            </div>
                                            <span style={{ color: '#94A3B8', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{b.eventName}</span>
                                        </div>
                                    ))}
                                    {users.slice(0, 2).map((u, i) => (
                                        <div key={`u${i}`} style={S.activityItem}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={S.dot('#6366F1')} />
                                                <span style={{ fontSize: '0.875rem', color: '#0F172A' }}>New user registered: <strong>{u.username}</strong></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <div style={S.card}>
                                    <div style={S.sectionTitle}>Quick Actions</div>
                                    <button style={S.quickBtn} onClick={() => setActiveTab('bookings')}>📋 View Registrations</button>
                                    <button style={S.quickBtn} onClick={() => setActiveTab('events')}>➕ Create New Event</button>
                                    <button style={S.quickBtn} onClick={() => setActiveTab('bookings')}>📊 Export Reports</button>
                                    <button style={S.quickBtn} onClick={() => setActiveTab('users')}>⚙️ System Settings</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BOOKINGS TAB ── */}
                    {activeTab === 'bookings' && (
                        <div className="animate-fade-in">
                            <div style={S.pageTitle}>Booking Registrations</div>
                            <div style={S.pageSubtitle}>All ticket purchase records</div>
                            <div style={S.card}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr style={S.tableHead}>
                                        <th style={S.th}>Attendee</th>
                                        <th style={S.th}>Event</th>
                                        <th style={S.th}>Tickets</th>
                                        <th style={S.th}>Amount</th>
                                    </tr></thead>
                                    <tbody>
                                        {bookings.map(b => (
                                            <tr key={b.id}>
                                                <td style={S.td}><strong>{b.userName}</strong><br/><small style={{ color: '#64748B' }}>{b.email}</small></td>
                                                <td style={S.td}>{b.eventName}</td>
                                                <td style={{ ...S.td, color: '#10B981', fontWeight: 800 }}>x{b.ticketsBooked}</td>
                                                <td style={{ ...S.td, fontWeight: 700 }}>₹{b.totalAmount}</td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && <tr><td colSpan="4" style={{ ...S.td, textAlign: 'center', color: '#94A3B8' }}>No bookings yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── USERS TAB ── */}
                    {activeTab === 'users' && (
                        <div className="animate-fade-in">
                            <div style={S.pageTitle}>User Management</div>
                            <div style={S.pageSubtitle}>Manage registered accounts and roles</div>
                            <div style={S.card}>
                                <input type="text" placeholder="Search by username or email..." value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.9rem', marginBottom: '1.25rem', boxSizing: 'border-box' }} />
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr style={S.tableHead}>
                                        <th style={S.th}>Username</th>
                                        <th style={S.th}>Email</th>
                                        <th style={S.th}>Role</th>
                                        <th style={S.th}>Actions</th>
                                    </tr></thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id}>
                                                <td style={S.td}><strong>{u.username}</strong></td>
                                                <td style={S.td}>{u.email}</td>
                                                <td style={{ ...S.td, color: u.role === 'Admin' ? '#EF4444' : '#10B981', fontWeight: 700 }}>{u.role}</td>
                                                <td style={S.td}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {u.role !== 'Admin' && <button onClick={() => handleRole(u.id, 'Admin')} style={{ padding: '0.3rem 0.7rem', background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Make Admin</button>}
                                                        {u.role === 'Admin' && <button onClick={() => handleRole(u.id, 'User')} style={{ padding: '0.3rem 0.7rem', background: '#FFFBEB', color: '#D97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Remove Admin</button>}
                                                        <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '0.3rem 0.7rem', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── EVENTS TAB ── */}
                    {activeTab === 'events' && (
                        <div className="animate-fade-in">
                            <div style={S.pageTitle}>Manage Events</div>
                            <div style={S.pageSubtitle}>Create, edit and remove campus events</div>

                            {/* Create Form */}
                            <div style={{ ...S.card, marginBottom: '1.5rem' }}>
                                <div style={S.sectionTitle}>➕ Create New Event</div>
                                <form onSubmit={handleCreateEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                    {[['Event Name', 'name', 'text'], ['Department', 'department', 'text'], ['Date / Time', 'date', 'text'], ['Venue', 'venue', 'text'], ['Price (Rs.)', 'price', 'number'], ['Tickets Available', 'availableTickets', 'number']].map(([ph, key, type]) => (
                                        <input key={key} type={type} required placeholder={ph}
                                            style={{ padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.9rem', color: '#0F172A' }}
                                            value={newEvent[key]} onChange={e => setNewEvent({ ...newEvent, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
                                    ))}
                                    <button type="submit" style={{ gridColumn: 'span 2', padding: '0.85rem', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Create Event</button>
                                </form>
                            </div>

                            {/* Events Table */}
                            <div style={S.card}>
                                <div style={S.sectionTitle}>All Events</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr style={S.tableHead}>
                                        <th style={S.th}>#</th>
                                        <th style={S.th}>Name</th>
                                        <th style={S.th}>Date / Venue</th>
                                        <th style={S.th}>Price</th>
                                        <th style={S.th}>Tickets</th>
                                        <th style={S.th}>Actions</th>
                                    </tr></thead>
                                    <tbody>
                                        {events.map(e => (
                                            <tr key={e.id}>
                                                {editingEventId === e.id ? (
                                                    <>
                                                        <td style={S.td}>#{e.id}</td>
                                                        <td colSpan="4" style={S.td}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                                                {[['name','Name'],['department','Dept'],['date','Date'],['venue','Venue'],['price','Price'],['availableTickets','Tickets']].map(([k,p]) => (
                                                                    <input key={k} placeholder={p} value={editFormData[k] || ''} onChange={ev => setEditFormData({...editFormData,[k]:ev.target.value})}
                                                                        style={{ padding: '0.45rem 0.6rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.85rem' }} />
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td style={S.td}>
                                                            <button onClick={() => handleUpdateEvent(e.id)} style={{ padding: '0.35rem 0.7rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginRight: '0.4rem' }}>Save</button>
                                                            <button onClick={() => setEditingEventId(null)} style={{ padding: '0.35rem 0.7rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ ...S.td, color: '#94A3B8' }}>#{e.id}</td>
                                                        <td style={S.td}><strong>{e.name}</strong><br/><small style={{ color: '#94A3B8' }}>{e.department}</small></td>
                                                        <td style={S.td}>{e.date}<br/><small style={{ color: '#94A3B8' }}>{e.venue}</small></td>
                                                        <td style={{ ...S.td, fontWeight: 700 }}>₹{e.price}</td>
                                                        <td style={{ ...S.td, color: '#10B981', fontWeight: 700 }}>{e.availableTickets}</td>
                                                        <td style={S.td}>
                                                            <button onClick={() => handleEditClick(e)} style={{ padding: '0.35rem 0.7rem', background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginRight: '0.4rem' }}>Edit</button>
                                                            <button onClick={() => handleDeleteEvent(e.id)} style={{ padding: '0.35rem 0.7rem', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Delete</button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
