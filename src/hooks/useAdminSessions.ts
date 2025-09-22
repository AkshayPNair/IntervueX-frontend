import { useEffect, useState } from 'react';
import { getAdminSessions } from '../services/adminService';
import type { AdminBookingList } from '../types/booking.types';

export const useAdminSessions = () => {
  const [sessions, setSessions] = useState<AdminBookingList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSessions();
      setSessions(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { sessions, loading, error, reload: load };
};