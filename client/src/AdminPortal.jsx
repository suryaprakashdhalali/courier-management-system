import React, { useState, useEffect } from 'react';

export default function AdminPortal() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('adminAuth') === 'true');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [analytics, setAnalytics] = useState(null);
  const [allShipments, setAllShipments] = useState([]);
  const [timeframe, setTimeframe] = useState('allTime');
  const [refreshing, setRefreshing] = useState(false);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetRole, setResetRole] = useState('admin');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  // Selected chat modal for full complaint view
  const [selectedChat, setSelectedChat] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [isAdminLoggedIn]);

  const fetchAdminData = async (startDate = '', endDate = '') => {
    try {
      setRefreshing(true);
      let url = 'http://localhost:5000/api/admin/analytics';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setAnalytics(data);

      const shipRes = await fetch('http://localhost:5000/api/shipments');
      const shipData = await shipRes.json();
      if (shipRes.ok) setAllShipments(shipData);
    } catch (err) {
      console.log('Error fetching admin data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('adminAuth', 'true');
        setErrorMsg('');
      } else {
        setErrorMsg(data.error || 'Invalid Admin credentials.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('adminAuth');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: resetRole, email: resetEmail, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMsg(data.message);
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetMsg('');
        }, 2000);
      } else {
        setResetMsg(data.error || 'Password reset failed.');
      }
    } catch (err) {
      setResetMsg('Server connection error.');
    }
  };

  const handleAdminUpdate = async (trk, newStatus, rider) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/shipments/${trk}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, assignedRider: rider })
      });
      if (res.ok) {
        fetchAdminData();
        alert('Shipment updated successfully!');
      }
    } catch (err) {
      alert('Failed to update shipment.');
    }
  };

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedChat) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/support/chats/${selectedChat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: adminReplyText, status: 'In Progress' })
      });
      const updated = await res.json();
      if (res.ok) {
        setSelectedChat(updated);
        setAdminReplyText('');
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to send reply.');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '380px', color: '#f8fafc' }}>
          <h2 style={{ textAlign: 'center', color: '#38bdf8', marginTop: 0 }}>🛡️ Operations Admin Desk</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginBottom: '25px' }}>SHREE VENKATESA COURIER SERVICE</p>
          
          {errorMsg && <div style={{ background: '#450a0a', color: '#fca5a5', padding: '10px', borderRadius: '4px', textAlign: 'center', fontSize: '13px', marginBottom: '15px' }}>{errorMsg}</div>}

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#cbd5e1' }}>Admin Email:</label>
              <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Enter admin email" required style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#cbd5e1' }}>Admin Password:</label>
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Enter admin password" required style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>

            {/* FORGOT PASSWORD LINK */}
            <p onClick={() => { setShowForgotPassword(true); setResetRole('admin'); }} style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer', textAlign: 'right', marginTop: '-5px', marginBottom: '20px' }}>
              Forgot Password?
            </p>

            <button type="submit" style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Access Operations Control</button>
          </form>
        </div>

        {/* FORGOT PASSWORD MODAL */}
        {showForgotPassword && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#1e293b', padding: '30px', borderRadius: '10px', width: '360px', color: '#fff', border: '1px solid #38bdf8' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#38bdf8' }}>🔑 Reset Account Password</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Select role, enter registered email & new password.</p>
              
              {resetMsg && <div style={{ background: resetMsg.includes('success') ? '#14532d' : '#7f1d1d', color: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px', marginBottom: '15px' }}>{resetMsg}</div>}
              
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Account Type:</label>
                  <select value={resetRole} onChange={(e) => setResetRole(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}>
                    <option value="admin">Operations Admin</option>
                    <option value="customer">Customer</option>
                    <option value="driver">Delivery Rider</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Registered Email:</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required placeholder="email@example.com" style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>New Password:</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Enter new password" style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Update Password</button>
                  <button type="button" onClick={() => setShowForgotPassword(false)} style={{ padding: '10px', background: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentStats = timeframe === 'customRange' 
    ? (analytics?.analytics?.customRange || { revenue: 0, profit: 0, count: 0 })
    : (analytics ? analytics.analytics[timeframe] : { revenue: 0, profit: 0, count: 0 });

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#38bdf8' }}>🛠️ Operations Command & Financial Dashboard</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Shree Venkatesa Courier Service | Admin Session Active</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => fetchAdminData()} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {refreshing ? 'Updating...' : '🔄 Refresh Data'}
          </button>
          <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Exit Desk</button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Total Customers Registered</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px' }}>{analytics?.totalCustomers || 0}</h2>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Successful Deliveries</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#4ade80' }}>{analytics?.deliveryStats?.delivered || 0}</h2>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Failed / RTO Deliveries</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#f87171' }}>{analytics?.deliveryStats?.failedRTO || 0}</h2>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Active In-Transit Shipments</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#facc15' }}>{analytics?.deliveryStats?.active || 0}</h2>
        </div>
      </div>

      {/* STEP 5: Custom Date Range Profit & Revenue Inspector */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #0284c7' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#38bdf8' }}>📅 Custom Date Profit Inspector (Step 5)</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>Select any specific custom date range to check revenue and net profit for that exact period.</p>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>Start Date:</label>
            <input type="date" id="startDateFilter" style={{ padding: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>End Date:</label>
            <input type="date" id="endDateFilter" style={{ padding: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
          </div>
          <button onClick={() => {
            const start = document.getElementById('startDateFilter').value;
            const end = document.getElementById('endDateFilter').value;
            if(!start || !end) {
              alert('Please select both start and end dates.');
              return;
            }
            setTimeframe('customRange');
            fetchAdminData(start, end);
          }} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px' }}>Calculate Custom Range Profit</button>
        </div>
      </div>

      {/* Profit & Revenue Filter Board */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, color: '#38bdf8' }}>💰 Financial Revenue & Profit Analytics</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['today', 'thisWeek', 'thisMonth', 'thisYear', 'prevYears', 'allTime'].map((tf) => (
              <button key={tf} onClick={() => setTimeframe(tf)} style={{ background: timeframe === tf ? '#0284c7' : '#334155', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' }}>
                {tf.replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', background: '#0f172a', padding: '20px', borderRadius: '6px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Revenue ({timeframe}):</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#38bdf8' }}>₹{currentStats.revenue}</h2>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Estimated Net Profit (35%):</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#4ade80' }}>₹{currentStats.profit}</h2>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Bookings Handled:</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#facc15' }}>{currentStats.count} packages</h2>
          </div>
        </div>
      </div>

      {/* Customer Directory */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>👥 Customer Directory ({analytics?.customers?.length || 0})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {analytics?.customers?.map((c) => (
            <div key={c._id} style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
              <strong>{c.name}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>{c.email}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Customer Support & Complaints Desk */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>🤖 AI Customer Service & Escalated Complaints</h3>
        {!analytics?.aiChats || analytics.aiChats.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No support conversations recorded yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {analytics.aiChats.map((chat) => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <div key={chat._id} onClick={() => setSelectedChat(chat)} style={{ background: '#0f172a', border: chat.escalatedToAdmin ? '1px solid #dc2626' : '1px solid #334155', padding: '15px', borderRadius: '6px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#38bdf8' }}>{chat.customerName}</strong>
                    {chat.escalatedToAdmin ? (
                      <span style={{ background: '#dc2626', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>Escalated</span>
                    ) : (
                      <span style={{ background: '#16a34a', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '3px' }}>AI Handled</span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8' }}>{chat.customerEmail}</p>
                  <div style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    "{lastMsg?.text || 'No messages'}"
                  </div>
                  <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>
                    Click to Open Full Complaint ➔
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL COMPLAINT MODAL */}
      {selectedChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', width: '600px', maxHeight: '80vh', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #38bdf8' }}>
            <div style={{ background: '#0f172a', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
              <div>
                <h3 style={{ margin: 0, color: '#38bdf8' }}>Complaint Details: {selectedChat.customerName}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{selectedChat.customerEmail}</span>
              </div>
              <button onClick={() => setSelectedChat(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Close X</button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#0f172a' }}>
              {selectedChat.messages.map((m, idx) => (
                <div key={idx} style={{ marginBottom: '12px', textAlign: m.sender === 'user' ? 'left' : m.sender === 'admin' ? 'right' : 'left' }}>
                  <div style={{ display: 'inline-block', maxWidth: '80%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: m.sender === 'user' ? '#334155' : m.sender === 'admin' ? '#0284c7' : '#1e293b', color: '#fff', textAlign: 'left', border: m.sender === 'ai' ? '1px dashed #38bdf8' : 'none' }}>
                    <strong style={{ display: 'block', fontSize: '10px', marginBottom: '2px', color: '#38bdf8' }}>{m.sender === 'user' ? selectedChat.customerName : m.sender === 'admin' ? 'Operations Admin' : 'AI Assistant'}</strong>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendAdminReply} style={{ display: 'flex', padding: '15px', background: '#1e293b', borderTop: '1px solid #334155' }}>
              <input type="text" value={adminReplyText} onChange={(e) => setAdminReplyText(e.target.value)} placeholder="Type direct admin reply to customer..." style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '8px' }}>Send Reply</button>
            </form>
          </div>
        </div>
      )}

      {/* Fleet & Shipment Operations Board */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>📦 Fleet Operations & Driver Assignment</h3>
        {allShipments.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No shipments recorded.</p>
        ) : (
          allShipments.map((item) => (
            <div key={item.trackingId} style={{ background: '#0f172a', padding: '15px', borderRadius: '6px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#38bdf8' }}>{item.trackingId}</strong> 
                <span style={{ marginLeft: '10px', background: item.status === 'RTO' ? '#dc2626' : '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{item.status}</span>
                <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Customer:</strong> {item.customerEmail} | <strong>Route:</strong> {item.originPincode} ➔ {item.receiverPincode}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Item: {item.itemDescription} ({item.weight} kg) | Fare: ₹{item.totalPrice}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select defaultValue={item.status} id={`status-${item.trackingId}`} style={{ padding: '6px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px' }}>
                  <option value="Order Booked">Order Booked</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="RTO">Return to Origin (RTO)</option>
                </select>
                <input type="text" defaultValue={item.assignedRider} id={`rider-${item.trackingId}`} placeholder="Rider Name" style={{ width: '100px', padding: '6px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px' }} />
                <button onClick={() => {
                  const status = document.getElementById(`status-${item.trackingId}`).value;
                  const rider = document.getElementById(`rider-${item.trackingId}`).value;
                  handleAdminUpdate(item.trackingId, status, rider);
                }} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Apply</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Feedback & Reviews Stream */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>⭐ Customer Feedback & Reviews</h3>
        {!analytics?.feedbacks || analytics.feedbacks.length === 0 ? <p style={{ color: '#94a3b8' }}>No reviews yet.</p> : (
          analytics.feedbacks.map((fb, idx) => (
            <div key={idx} style={{ background: '#0f172a', padding: '10px', borderRadius: '4px', marginBottom: '10px', fontSize: '13px' }}>
              <p style={{ margin: '0 0 4px 0', color: '#facc15' }}>{"⭐".repeat(fb.rating)} ({fb.rating}/5)</p>
              <p style={{ margin: '0 0 4px 0' }}>"{fb.comment}"</p>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>By {fb.customerEmail} for {fb.trackingId}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}