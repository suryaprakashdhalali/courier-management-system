import React, { useState, useEffect } from 'react';

export default function DriverPortal() {
  const [isDriverLoggedIn, setIsDriverLoggedIn] = useState(() => localStorage.getItem('driverAuth') === 'true');
  const [driverEmail, setDriverEmail] = useState(() => localStorage.getItem('driverEmail') || '');
  const [driverPassword, setDriverPassword] = useState('');
  const [assignedShipments, setAssignedShipments] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetRole, setResetRole] = useState('driver');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  useEffect(() => {
    if (isDriverLoggedIn && driverEmail) {
      fetchDriverDeliveries();
      startLiveLocationBroadcast();
    }
  }, [isDriverLoggedIn, driverEmail]);

  const fetchDriverDeliveries = async () => {
    try {
      const res = await fetch(`https://courier-management-
system-re99.onrender.com/api/shipments?driverRider=Ramesh Rider`);
      const data = await res.json();
      if (res.ok) setAssignedShipments(data);
    } catch (err) {
      console.log('Error fetching driver deliveries');
    }
  };

  const startLiveLocationBroadcast = () => {
    if (!navigator.geolocation) return;
    setBroadcasting(true);
    navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        assignedShipments.forEach(async (item) => {
          if (['Picked Up', 'In Transit', 'Out for Delivery'].includes(item.status)) {
            await fetch(`https://courier-management-system-re99.onrender.com/api/driver/shipments/${item.trackingId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: latitude, lng: longitude })
            });
          }
        });
      },
      (error) => console.log('GPS error:', error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://courier-management-system-re99.onrender.com/api/driver/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: driverEmail, password: driverPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setIsDriverLoggedIn(true);
        localStorage.setItem('driverAuth', 'true');
        localStorage.setItem('driverEmail', driverEmail);
      } else {
        setErrorMsg(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    }
  };

  const handleStatusUpdate = async (trackingId, newStatus) => {
    try {
      const res = await fetch(`https://courier-management-system-re99.onrender.com/api/driver/shipments/${trackingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDriverDeliveries();
        alert('Delivery status updated successfully!');
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://courier-management-system-re99.onrender.com/api/reset-password', {
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

  if (!isDriverLoggedIn) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#312e81', padding: '40px', borderRadius: '10px', width: '380px', color: '#fff' }}>
          <h2 style={{ textAlign: 'center', color: '#818cf8', marginTop: 0 }}>🚚 Driver Delivery Desk</h2>
          <p style={{ textAlign: 'center', color: '#c7d2fe', fontSize: '12px', marginBottom: '20px' }}>Shree Venkatesa Courier Partner Portal</p>
          {errorMsg && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px', marginBottom: '15px', borderRadius: '4px', textAlign: 'center' }}>{errorMsg}</div>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Driver Email:</label>
              <input type="email" value={driverEmail} onChange={(e) => setDriverEmail(e.target.value)} required placeholder="driver@shreevenkatesa.com" style={{ width: '100%', padding: '10px', background: '#1e1b4b', border: '1px solid #4338ca', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Password:</label>
              <input type="password" value={driverPassword} onChange={(e) => setDriverPassword(e.target.value)} required placeholder="driver123" style={{ width: '100%', padding: '10px', background: '#1e1b4b', border: '1px solid #4338ca', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <p onClick={() => { setShowForgotPassword(true); setResetRole('driver'); }} style={{ fontSize: '12px', color: '#818cf8', cursor: 'pointer', textAlign: 'right', marginTop: '-5px', marginBottom: '15px' }}>
              Forgot Password?
            </p>
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Login to Driver Portal</button>
          </form>
        </div>

        {/* FORGOT PASSWORD MODAL */}
        {showForgotPassword && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#312e81', padding: '30px', borderRadius: '10px', width: '360px', color: '#fff' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#818cf8' }}>🔑 Reset Password</h3>
              <p style={{ fontSize: '12px', color: '#c7d2fe', marginBottom: '20px' }}>Enter your registered account email and new password.</p>
              {resetMsg && <div style={{ background: resetMsg.includes('success') ? '#14532d' : '#7f1d1d', color: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px', marginBottom: '15px' }}>{resetMsg}</div>}
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Role:</label>
                  <select value={resetRole} onChange={(e) => setResetRole(e.target.value)} style={{ width: '100%', padding: '8px', background: '#1e1b4b', border: '1px solid #4338ca', color: '#fff', borderRadius: '4px' }}>
                    <option value="driver">Delivery Rider</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Operations Admin</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Registered Email:</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required placeholder="email@example.com" style={{ width: '100%', padding: '8px', background: '#1e1b4b', border: '1px solid #4338ca', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>New Password:</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Enter new password" style={{ width: '100%', padding: '8px', background: '#1e1b4b', border: '1px solid #4338ca', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Update Password</button>
                  <button type="button" onClick={() => setShowForgotPassword(false)} style={{ padding: '10px', background: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#1e1b4b', color: '#fff', padding: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#312e81', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#818cf8' }}>🚚 Delivery Rider Command Center</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#c7d2fe' }}>Partner: Ramesh Rider | GPS Broadcast: {broadcasting ? '🟢 Active' : '🔴 Inactive'}</p>
        </div>
        <button onClick={() => { setIsDriverLoggedIn(false); localStorage.removeItem('driverAuth'); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      <div style={{ background: '#312e81', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#818cf8' }}>📦 Assigned Deliveries ({assignedShipments.length})</h3>
        {assignedShipments.length === 0 ? (
          <p style={{ color: '#c7d2fe' }}>No packages assigned to you currently.</p>
        ) : (
          assignedShipments.map((item) => (
            <div key={item.trackingId} style={{ background: '#1e1b4b', padding: '15px', borderRadius: '6px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#818cf8' }}>{item.trackingId}</strong>
                <span style={{ marginLeft: '10px', background: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{item.status}</span>
                <p style={{ margin: '5px 0', fontSize: '13px' }}><strong>Receiver:</strong> {item.receiverName} ({item.receiverPhone})</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#c7d2fe' }}>Address: {item.receiverAddress}, {item.receiverPincode}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select defaultValue={item.status} id={`driver-status-${item.trackingId}`} style={{ padding: '8px', background: '#312e81', color: '#fff', border: 'none', borderRadius: '4px' }}>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="RTO">Return to Origin (RTO)</option>
                </select>
                <button onClick={() => {
                  const status = document.getElementById(`driver-status-${item.trackingId}`).value;
                  handleStatusUpdate(item.trackingId, status);
                }} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Update</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}