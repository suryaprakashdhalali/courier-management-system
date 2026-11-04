import React, { useState, useEffect } from 'react';
import CustomerApp from './CustomerApp';
import AdminPortal from './AdminPortal';
import DriverPortal from './DriverPortal';

export default function App() {
  const [currentHost, setCurrentHost] = useState(window.location.hostname);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentHost(window.location.hostname);
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  if (currentHost.includes('admin') || currentPath === '/admin') {
    return <AdminPortal />;
  }
  if (currentHost.includes('driver') || currentPath === '/driver') {
    return <DriverPortal />;
  }

  return <CustomerApp />;
}