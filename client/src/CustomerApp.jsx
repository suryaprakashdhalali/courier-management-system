import React, { useState, useEffect, useRef } from 'react';

export default function CustomerApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('customerAuth') === 'true');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('customerEmail') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('customerName') || '');

  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Booking Form State
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [originPincode, setOriginPincode] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverPincode, setReceiverPincode] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [serviceType, setServiceType] = useState('Standard');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('09:00 AM - 12:00 PM');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Dashboard & Tracking State
  const [trackingId, setTrackingId] = useState('');
  const [searchedShipment, setSearchedShipment] = useState(null);
  const [customerShipments, setCustomerShipments] = useState([]);
  const [activeTab, setActiveTab] = useState('book');
  const [message, setMessage] = useState('');

  // AI Agent Chat State
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [currentInput, setCurrentInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn && userEmail) {
      fetchShipments();
      fetchChats();
    }
  }, [isLoggedIn, userEmail]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId]);

  const fetchShipments = async () => {
    try {
      const res = await fetch(`https://courier-management-system-re99.onrender.com/api/shipments?email=${userEmail}`);
      const data = await res.json();
      if (res.ok) setCustomerShipments(data);
    } catch (err) {
      console.log('Error fetching shipments');
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch(`https://courier-management-system-re99.onrender.com/api/support/chats?email=${userEmail}`);
      const data = await res.json();
      if (res.ok) {
        setChats(data);
        if (data.length > 0 && !activeChatId) {
          setActiveChatId(data[0]._id);
        }
      }
    } catch (err) {
      console.log('Error fetching chats');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://courier-management-system-re99.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful! Please log in.');
        setIsRegistering(false);
        setAuthPassword('');
      } else {
        setMessage(data.error || 'Registration failed.');
      }
    } catch (err) {
      setMessage('Server connection error.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://courier-management-system-re99.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setIsLoggedIn(true);
        setUserEmail(data.email);
        setUserName(data.name);
        localStorage.setItem('customerAuth', 'true');
        localStorage.setItem('customerEmail', data.email);
        localStorage.setItem('customerName', data.name);
        setMessage('');
      } else {
        setMessage(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setMessage('Server connection error.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://courier-management-system-re99.onrender.com/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'customer', email: authEmail, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password updated successfully! You can now log in.');
        setIsForgotPassword(false);
        setAuthPassword('');
        setNewPassword('');
      } else {
        setMessage(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setMessage('Server connection error.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setUserName('');
    localStorage.removeItem('customerAuth');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerName');
  };

  const handleBookShipment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://courier-management-system-re99.onrender.com/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName, senderPhone, customerEmail: userEmail,
          receiverName, receiverPhone, receiverAddress, receiverPincode,
          originPincode, itemDescription, weight: Number(weight),
          length: Number(length), width: Number(width), height: Number(height),
          serviceType, pickupDate, pickupSlot, paymentMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Shipment Booked! Tracking ID: ${data.trackingId} | Total (Incl. 18% GST): ₹${data.totalPrice}`);
        setSenderName(''); setSenderPhone(''); setOriginPincode('');
        setReceiverName(''); setReceiverPhone(''); setReceiverAddress(''); setReceiverPincode('');
        setItemDescription(''); setWeight(''); setLength(''); setWidth(''); setHeight('');
        fetchShipments();
        setActiveTab('history');
      } else {
        setMessage(data.error || 'Booking failed.');
      }
    } catch (err) {
      setMessage('Server connection error.');
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://courier-management-system-re99.onrender.com/api/shipments/${trackingId}`);
      const data = await res.json();
      if (res.ok) {
        setSearchedShipment(data);
        setMessage('');
      } else {
        setSearchedShipment(null);
        setMessage('Shipment not found.');
      }
    } catch (err) {
      setMessage('Server connection error.');
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    try {
      const res = await fetch('https://courier-management-system-re99.onrender.com/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: userName,
          customerEmail: userEmail,
          message: currentInput,
          chatId: activeChatId
        })
      });
      const updatedChat = await res.json();
      if (res.ok) {
        setCurrentInput('');
        setActiveChatId(updatedChat._id);
        fetchChats();
      }
    } catch (err) {
      console.log('Error sending chat message');
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
  };

  const handleFeedbackSubmit = async (trk, e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://courier-management-
system-re99.onrender.com/api/shipments/${trk}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: Number(feedbackRating), comment: feedbackComment })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Thank you for your feedback!');
        fetchShipments();
      } else {
        alert(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      alert('Server connection error.');
    }
  };

  const nameParts = userName.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : userName;

  if (!isLoggedIn) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '420px', margin: '80px auto', padding: '30px', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#2c3e50', textAlign: 'center', fontSize: '22px' }}>SHREE VENKATESA COURIER SERVICE</h1>
        <p style={{ textAlign: 'center', color: '#7f8c8d', fontSize: '13px', marginBottom: '20px' }}>
          {isForgotPassword ? 'Reset Customer Password' : 'Customer Portal Login'}
        </p>

        {message && <div style={{ background: '#e8f4f8', padding: '10px', marginBottom: '15px', borderRadius: '4px', color: '#2980b9', textAlign: 'center', fontSize: '13px' }}>{message}</div>}

        {isForgotPassword ? (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '13px' }}>Email Address:</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '13px' }}>New Password:</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ background: '#e67e22', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
              Update Password
            </button>
            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#555' }}>
              Remembered your password?{' '}
              <span onClick={() => { setIsForgotPassword(false); setMessage(''); }} style={{ color: '#2980b9', cursor: 'pointer', fontWeight: 'bold' }}>
                Login here
              </span>
            </p>
          </form>
        ) : (
          <>
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
              {isRegistering && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '13px' }}>Full Name:</label>
                  <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '13px' }}>Email Address:</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '13px' }}>Password:</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
                {isRegistering ? 'Register Account' : 'Secure Login'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '13px' }}>
              <span onClick={() => { setIsForgotPassword(true); setMessage(''); }} style={{ color: '#e67e22', cursor: 'pointer', fontWeight: 'bold' }}>
                Forgot Password?
              </span>
              <span onClick={() => { setIsRegistering(!isRegistering); setMessage(''); }} style={{ color: '#2980b9', cursor: 'pointer', fontWeight: 'bold' }}>
                {isRegistering ? 'Login here' : 'Register here'}
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  const activeChat = chats.find(c => c._id === activeChatId);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '30px auto', padding: '20px', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={handleLogout} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #2c3e50, #2980b9)', color: '#fff', padding: '30px 20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', letterSpacing: '1px' }}>Welcome, {lastName}</h1>
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '300', letterSpacing: '2px', textTransform: 'uppercase' }}>Shree Venkatesa Courier Service</h2>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('book')} style={{ background: activeTab === 'book' ? '#2980b9' : '#ecf0f1', color: activeTab === 'book' ? '#fff' : '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Book & Calculator</button>
        <button onClick={() => setActiveTab('history')} style={{ background: activeTab === 'history' ? '#2980b9' : '#ecf0f1', color: activeTab === 'history' ? '#fff' : '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>My Deliveries & Feedback</button>
        <button onClick={() => setActiveTab('track')} style={{ background: activeTab === 'track' ? '#2980b9' : '#ecf0f1', color: activeTab === 'track' ? '#fff' : '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Live Tracking</button>
        <button onClick={() => setActiveTab('support')} style={{ background: activeTab === 'support' ? '#2980b9' : '#ecf0f1', color: activeTab === 'support' ? '#fff' : '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🤖 AI Customer Service Agent</button>
      </div>

      {message && <div style={{ background: '#e8f4f8', padding: '10px', marginBottom: '20px', borderRadius: '4px', color: '#2980b9', textAlign: 'center', fontSize: '13px' }}>{message}</div>}

      {/* TAB 1: BOOKING & RATE CALCULATOR */}
      {activeTab === 'book' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>Schedule Pickup & Dynamic Rate Calculator</h3>
          <form onSubmit={handleBookShipment}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Sender Name:</label>
                <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Sender Phone:</label>
                <input type="tel" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Origin Pincode:</label>
                <input type="text" value={originPincode} onChange={(e) => setOriginPincode(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Receiver Name:</label>
                <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Receiver Phone:</label>
                <input type="tel" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Destination Pincode:</label>
                <input type="text" value={receiverPincode} onChange={(e) => setReceiverPincode(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Receiver Full Address:</label>
              <input type="text" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Street, Landmark, City" required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Item Description:</label>
                <input type="text" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Electronics, Docs" required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Deadweight (kg):</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="1.0" required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Dimensions (L×W×H cm):</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="L" required style={{ width: '32%', padding: '6px' }} />
                  <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="W" required style={{ width: '32%', padding: '6px' }} />
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="H" required style={{ width: '32%', padding: '6px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Service Type:</label>
                <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={{ width: '100%', padding: '7px', boxSizing: 'border-box' }}>
                  <option value="Standard">Standard (3-5 Days)</option>
                  <option value="Express">Express (1-2 Days)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Pickup Date:</label>
                <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Pickup Time Slot:</label>
                <select value={pickupSlot} onChange={(e) => setPickupSlot(e.target.value)} style={{ width: '100%', padding: '7px', boxSizing: 'border-box' }}>
                  <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                  <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', fontSize: '12px' }}>Payment Method:</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '7px', boxSizing: 'border-box' }}>
                  <option value="UPI">UPI (Google Pay / PhonePe)</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                </select>
              </div>
            </div>

            <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', marginTop: '20px' }}>Confirm Booking & Calculate Tax</button>
          </form>
        </div>
      )}

      {/* TAB 2: MY DELIVERIES & FEEDBACK */}
      {activeTab === 'history' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>My Deliveries, Waybills & Delivery Feedback</h3>
          {customerShipments.length === 0 ? (
            <p>No shipments booked yet.</p>
          ) : (
            customerShipments.map((item) => (
              <div key={item.trackingId} style={{ background: '#fdfdfd', border: '1px solid #e0e0e0', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                  <strong>Consignment ID: {item.trackingId}</strong>
                  <span style={{ background: item.status === 'RTO' ? '#e74c3c' : '#2980b9', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{item.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '13px', gap: '10px' }}>
                  <div>
                    <p style={{ margin: '2px 0' }}><strong>Receiver:</strong> {item.receiverName} ({item.receiverPhone})</p>
                    <p style={{ margin: '2px 0' }}><strong>Address:</strong> {item.receiverAddress}, {item.receiverPincode}</p>
                  </div>
                  <div>
                    <p style={{ margin: '2px 0' }}><strong>Item:</strong> {item.itemDescription} ({item.weight} kg)</p>
                    <p style={{ margin: '2px 0' }}><strong>Service:</strong> {item.serviceType}</p>
                  </div>
                  <div>
                    <p style={{ margin: '2px 0' }}><strong>Subtotal:</strong> ₹{item.subtotal}</p>
                    <p style={{ margin: '2px 0' }}><strong>GST (18%):</strong> ₹{item.gstAmount}</p>
                    {item.rtoFeeCharged > 0 && <p style={{ margin: '2px 0', color: '#e74c3c' }}><strong>RTO Penalty Fee:</strong> ₹{item.rtoFeeCharged}</p>}
                    <p style={{ margin: '2px 0', color: '#27ae60', fontWeight: 'bold' }}>Total: ₹{item.totalPrice} ({item.paymentMethod})</p>
                  </div>
                </div>

                {item.status === 'Delivered' && (
                  <div style={{ marginTop: '12px', background: '#e8f8f5', padding: '10px', borderRadius: '4px', border: '1px solid #a3e4d7' }}>
                    {item.feedback && item.feedback.rating ? (
                      <p style={{ margin: 0, fontSize: '13px', color: '#117a65' }}>
                        ⭐ <strong>Your Feedback:</strong> {item.feedback.rating}/5 stars - "{item.feedback.comment}"
                      </p>
                    ) : (
                      <form onSubmit={(e) => handleFeedbackSubmit(item.trackingId, e)} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Rate Delivery:</span>
                        <select value={feedbackRating} onChange={(e) => setFeedbackRating(e.target.value)} style={{ padding: '4px' }}>
                          <option value="5">5 ⭐ (Excellent)</option>
                          <option value="4">4 ⭐ (Good)</option>
                          <option value="3">3 ⭐ (Average)</option>
                          <option value="2">2 ⭐ (Poor)</option>
                          <option value="1">1 ⭐ (Terrible)</option>
                        </select>
                        <input type="text" value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Write your feedback..." required style={{ flex: 1, padding: '4px' }} />
                        <button type="submit" style={{ background: '#16a085', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Submit</button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: LIVE TRACKING ENGINE */}
      {activeTab === 'track' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>Real-Time Tracking Engine</h3>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="Enter Consignment ID (e.g. TRK123456)" required style={{ flex: 1, padding: '10px', boxSizing: 'border-box' }} />
            <button type="submit" style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Track Package</button>
          </form>

          {searchedShipment && (
            <div style={{ background: '#f1c40f22', padding: '15px', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Shipment Status: {searchedShipment.status}</h4>
              <p style={{ margin: '4px 0' }}><strong>Assigned Rider:</strong> {searchedShipment.assignedRider}</p>
              <p style={{ margin: '4px 0' }}><strong>Route:</strong> {searchedShipment.originPincode} ➔ {searchedShipment.receiverPincode}</p>
              <p style={{ margin: '4px 0' }}><strong>Receiver:</strong> {searchedShipment.receiverName}, {searchedShipment.receiverAddress}</p>
              
              {/* Live GPS Coordinates & Status Indicator */}
              <p style={{ margin: '4px 0' }}>
                <strong>Live GPS Location:</strong> Latitude {searchedShipment.currentLocation?.lat || '13.0827'}, Longitude {searchedShipment.currentLocation?.lng || '80.2707'}
              </p>
              <p style={{ margin: '4px 0', color: '#27ae60', fontWeight: 'bold' }}>
                📍 Live tracking signal active. Rider is on the route!
              </p>

              {searchedShipment.status === 'RTO' && (
                <p style={{ margin: '4px 0', color: '#e74c3c', fontWeight: 'bold' }}>
                  ⚠️ Return to Origin triggered. Full forward shipping penalty incurred.
                </p>
              )}
              
              <h5 style={{ margin: '15px 0 5px 0' }}>Status Timeline:</h5>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                {searchedShipment.statusHistory.map((h, idx) => (
                  <li key={idx}><strong>{h.status}</strong> on {new Date(h.timestamp).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI CUSTOMER SERVICE AGENT */}
      {activeTab === 'support' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>🤖 Virtual AI Customer Support Agent</h3>
            <button onClick={startNewChat} style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ New Conversation</button>
          </div>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Chat with our AI assistant regarding tracking, pricing, or issues. If the AI cannot resolve your problem, it will automatically escalate your ticket to the Operations Admin Desk.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '15px', height: '420px', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
            {/* Chat History Sidebar */}
            <div style={{ background: '#f8f9fa', borderRight: '1px solid #ddd', overflowY: 'auto', padding: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '10px' }}>Chat Sessions</p>
              {chats.map(c => (
                <div key={c._id} onClick={() => setActiveChatId(c._id)} style={{ padding: '10px', background: activeChatId === c._id ? '#2980b9' : '#fff', color: activeChatId === c._id ? '#fff' : '#333', borderRadius: '4px', cursor: 'pointer', marginBottom: '8px', fontSize: '13px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Chat #{c._id.slice(-4)}</span>
                    {c.escalatedToAdmin && <span style={{ fontSize: '10px', background: '#e74c3c', color: '#fff', padding: '1px 5px', borderRadius: '3px' }}>Escalated</span>}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.messages[c.messages.length - 1]?.text || 'No messages'}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Chat Box */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
              <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#fdfdfd' }}>
                {!activeChat ? (
                  <p style={{ textAlign: 'center', color: '#888', marginTop: '150px' }}>Start a new conversation below.</p>
                ) : (
                  activeChat.messages.map((m, idx) => (
                    <div key={idx} style={{ marginBottom: '12px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                      <div style={{ display: 'inline-block', maxWidth: '75%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: m.sender === 'user' ? '#2980b9' : m.sender === 'admin' ? '#8e44ad' : '#ecf0f1', color: m.sender === 'user' || m.sender === 'admin' ? '#fff' : '#333', textAlign: 'left' }}>
                        <strong style={{ display: 'block', fontSize: '10px', marginBottom: '2px', opacity: 0.8 }}>{m.sender === 'user' ? 'You' : m.sender === 'admin' ? 'Operations Admin' : 'AI Assistant'}</strong>
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChat} style={{ display: 'flex', borderTop: '1px solid #ddd', padding: '10px', background: '#f9f9f9' }}>
                <input type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} placeholder="Type your message or describe your problem..." style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                <button type="submit" style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '8px' }}>Send</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}