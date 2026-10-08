'use client';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import { hydrateAuth, logout } from '@/store/authSlice';
import { fetchPackages } from '@/store/packagesSlice';
import { fetchLocations } from '@/store/locationsSlice';

export default function Providers({ children }) {
  const [store] = useState(() => makeStore());
  useEffect(() => {
    store.dispatch(hydrateAuth());
    store.dispatch(fetchPackages());
    store.dispatch(fetchLocations());
  }, [store]);
  useEffect(() => {
    const clearStaleSession = () => store.dispatch(logout());
    window.addEventListener('crs:unauthorized', clearStaleSession);
    return () => window.removeEventListener('crs:unauthorized', clearStaleSession);
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
