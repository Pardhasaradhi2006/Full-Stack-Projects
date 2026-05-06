import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am the Campus Events Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const predefinedAnswers = {
    'hello': 'Hello! Welcome to the portal.',
    'hi': 'Hi there!',
    'book': 'To book a ticket, go to the Home page, select an event, and fill out the details.',
    'ticket': 'After successful payment, your entry ticket with a unique QR code will be generated.',
    'payment': 'We accept simulated payments via all major methods like PhonePe, GPay, and Paytm.',
    'contact': 'You can reach out to the Admin at admin@campusevents.com.'
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    
    setTimeout(() => {
      let reply = "I'm sorry, I don't understand that. You can ask me about booking, tickets, or payments.";
      const lowerInput = input.toLowerCase();
      for (const [key, value] of Object.entries(predefinedAnswers)) {
        if (lowerInput.includes(key)) {
          reply = value;
          break;
        }
      }
      setMessages([...newMessages, { sender: 'bot', text: reply }]);
    }, 600);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, fontFamily: 'var(--font-family)' }}>
      {isOpen ? (
        <div style={{ width: '320px', height: '450px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Support Assistant</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
          </div>
          
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#F8FAFC' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ background: msg.sender === 'user' ? '#6366F1' : '#E2E8F0', color: msg.sender === 'user' ? 'white' : '#1E293B', padding: '0.6rem 1rem', borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0', fontSize: '0.95rem', lineHeight: '1.4' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '0.8rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem', background: 'white' }}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..." 
              style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid #CBD5E1', borderRadius: '20px', outline: 'none', fontSize: '0.95rem' }} 
            />
            <button onClick={handleSend} style={{ background: '#6366F1', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', color: 'white', border: 'none', boxShadow: '0 8px 24px rgba(79,70,229,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
