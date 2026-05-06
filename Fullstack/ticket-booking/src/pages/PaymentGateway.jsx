import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

function generateTxId() {
    return 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

const PaymentGateway = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // If navigated directly, bounce back to home
    if (!location.state || !location.state.bookingData) {
        navigate('/');
        return null;
    }

    const { bookingData, eventData } = location.state;
    const amount = bookingData.tickets * eventData.price;

    const [paymentMethod, setPaymentMethod] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = Select & Send OTP, 2 = Verify, 3 = Success
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [systemOtp, setSystemOtp] = useState('');

    const handleSendOTP = async () => {
        if (!paymentMethod) { setError('Select a payment method'); return; }
        if (phone.length < 10) { setError('Enter a valid 10-digit number'); return; }
        
        setStatus('loading');
        setError('');
        try {
            await fetch('http://localhost:5000/api/payment/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            setTimeout(() => {
                setStatus('idle');
                setSystemOtp(Math.floor(1000 + Math.random() * 9000).toString());
                setStep(2);
            }, 1200);
        } catch {
            setError('Failed to contact provider');
            setStatus('idle');
        }
    };

    const handleVerify = async () => {
        if (otp.length < 4) { setError('Enter 4-digit OTP'); return; }
        setStatus('loading');
        setError('');
        try {
            // Check dynamic system OTP
            if (otp === systemOtp) {
                // Book in backend
                const bookRes = await fetch('http://localhost:5000/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventId: eventData.id,
                        userName: bookingData.name,
                        email: bookingData.email,
                        department: bookingData.department,
                        ticketsBooked: bookingData.tickets,
                        totalAmount: amount,
                        paymentStatus: 'Completed via ' + paymentMethod
                    })
                });

                if (bookRes.ok) {
                   setTransactionId(generateTxId());
                   setStatus('idle');
                   setStep(3);
                } else {
                   setError('Booking failed dynamically, tickets may have sold out');
                   setStatus('idle');
                }
            } else {
                setError(`Invalid OTP. Please enter the dynamically generated OTP: ${systemOtp}`);
                setStatus('idle');
            }
        } catch {
            setError('Failed to reach provider');
            setStatus('idle');
        }
    };

    const logos = {
        PhonePe: <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" height="26" style={{ objectFit: 'contain', verticalAlign: 'middle' }} />,
        GPay: <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" height="22" style={{ objectFit: 'contain', verticalAlign: 'middle' }} />,
        Paytm: <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" height="20" style={{ objectFit: 'contain', verticalAlign: 'middle' }} />,
        BHIM: <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="BHIM UPI" height="22" style={{ objectFit: 'contain', verticalAlign: 'middle' }} />
    };

    return (
        <div className="gateway-container animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, overflowY: 'auto' }}>
            <div className="glass-panel">
                
                <div className="gateway-sidebar">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 800 }}>Fee Portal</h2>
                    <p style={{ opacity: 0.8, marginBottom: '2rem', lineHeight: '1.5' }}>Complete your transaction securely directly through our institution's authorized payment gateway.</p>
                    
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                           <span style={{ opacity: 0.8 }}>Item Details</span>
                           <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{eventData.name} Ticket(s)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                           <span style={{ opacity: 0.8 }}>Quantity</span>
                           <span style={{ fontWeight: 600 }}>x{bookingData.tickets}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                           <span style={{ opacity: 0.8 }}>Attendee Contact</span>
                           <span style={{ fontWeight: 600 }}>{bookingData.name}</span>
                        </div>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '1.5rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', alignItems: 'center' }}>
                           <span>Total Amount</span>
                           <span style={{ fontWeight: 800, fontSize: '1.75rem' }}>Rs. {amount}</span>
                        </div>
                    </div>
                </div>

                <div className="gateway-main">
                    
                    {step === 3 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
                            <div className="receipt-container animate-fade-in" style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', color: '#111', width: '100%', maxWidth: '450px', margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                    <div className="animate-bouncing-ball" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white', fontSize: '3rem', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}>✓</div>
                                    <h2 style={{ color: '#059669', margin: 0, fontSize: '1.75rem' }}>Payment Authorized</h2>
                                    <p style={{ color: '#666', marginTop: '0.5rem' }}>Your formal receipt document is below.</p>
                                </div>
                                <div style={{ borderTop: '2px dashed #CBD5E1', borderBottom: '2px dashed #CBD5E1', padding: '1.5rem 0', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
                                    <p style={{ margin: '0 0 0.5rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Transaction ID:</span> <strong style={{ fontFamily: 'monospace', letterSpacing: '1px', color: '#0F172A' }}>{transactionId}</strong></p>
                                    <p style={{ margin: '0 0 0.5rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Event:</span> <strong style={{ color: '#0F172A' }}>{eventData.name}</strong></p>
                                    <p style={{ margin: '0 0 0.5rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Attendee:</span> <strong style={{ color: '#0F172A' }}>{bookingData.name}</strong></p>
                                    <p style={{ margin: '0 0 0.5rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Email:</span> <strong style={{ color: '#0F172A' }}>{bookingData.email}</strong></p>
                                    <p style={{ margin: '0 0 0.5rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Linked Phone:</span> <strong style={{ color: '#0F172A' }}>{phone}</strong></p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', background: '#F1F5F9', padding: '1rem', borderRadius: '12px' }}>
                                    <QRCodeSVG value={`TXN:${transactionId}|EVT:${eventData.id}|QTY:${bookingData.tickets}|USR:${bookingData.email}`} size={120} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, marginBottom: '2rem', color: '#0F172A' }}>
                                    <span>Total Finalized</span>
                                    <span>Rs. {amount}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                    <button onClick={() => window.print()} className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', background: '#334155' }}>Print & Save Ticket PDF</button>
                                    <button onClick={() => navigate('/')} className="btn" style={{ width: '100%', padding: '1rem', background: 'transparent', color: '#64748B', fontWeight: 600 }}>Return to Dashboard</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            
                            {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ {error}</div>}

                            {step === 1 && (
                                <div className="animate-fade-in">
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>Select Payment App</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We support all major verified UPI processors.</p>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                        {Object.keys(logos).map(method => (
                                            <button 
                                                key={method}
                                                onClick={() => {setPaymentMethod(method); setError('');}}
                                                style={{ 
                                                    padding: '1.25rem', borderRadius: '12px', border: paymentMethod === method ? '2px solid var(--primary)' : '1px solid var(--border)', 
                                                    background: paymentMethod === method ? 'rgba(79,70,229,0.05)' : '#FAFAFA', 
                                                    display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                                    color: 'var(--text-main)', 
                                                    boxShadow: paymentMethod === method ? '0 4px 12px rgba(79,70,229,0.15)' : 'none'
                                                }}
                                            >
                                                {logos[method]} {method}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Mobile Number mapped to {paymentMethod || 'App'}</label>
                                        <input type="tel" maxLength="10" placeholder="e.g. 9876543210" className="form-input" style={{ fontSize: '1.1rem', padding: '1rem', borderRadius: '10px' }} value={phone} onChange={e => {setPhone(e.target.value); setError('');}} />
                                    </div>

                                    <button onClick={handleSendOTP} disabled={status === 'loading'} className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.2rem', marginTop: '0.5rem', borderRadius: '50px' }}>
                                        {status === 'loading' ? <span className="processing-spinner"></span> : `Secure Checkout • Rs. ${amount}`}
                                    </button>
                                    
                                    <button onClick={() => navigate('/')} className="btn" style={{ background: 'transparent', color: 'var(--text-muted)', marginTop: '1rem', textDecoration: 'underline' }}>Cancel Transaction</button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}><span style={{ padding: '1.5rem', background: 'rgba(79,70,229,0.1)', borderRadius: '50%', boxShadow: '0 4px 12px rgba(79,70,229,0.1)' }}>{logos[paymentMethod]}</span></div>
                                    <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 700 }}>Enter App Validation PIN</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>We pinged your {paymentMethod} account mapped to <br/><strong style={{color: 'var(--text-main)'}}>+** **** **{phone.slice(-4) || '3210'}</strong>. Enter the OTP code to approve this fee transfer.</p>
                                    
                                    <div className="form-group" style={{ maxWidth: '300px', margin: '0 auto 2.5rem' }}>
                                        <input type="text" maxLength="4" placeholder={systemOtp} className="form-input" style={{ textAlign: 'center', letterSpacing: '0.8em', fontSize: '2rem', fontWeight: 700, padding: '1rem', borderRadius: '12px' }} value={otp} onChange={e => {setOtp(e.target.value); setError('');}} />
                                    </div>

                                    <button onClick={handleVerify} disabled={status === 'loading'} className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.2rem', background: 'var(--success)', borderRadius: '50px' }}>
                                        {status === 'loading' ? <span className="processing-spinner"></span> : `Verify Payment of Rs. ${amount}`}
                                    </button>
                                    <button onClick={() => {setStep(1); setOtp('');}} className="btn" style={{ background: 'transparent', color: 'var(--text-muted)', marginTop: '1rem', textDecoration: 'underline' }}>Change Payment App</button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default PaymentGateway;
