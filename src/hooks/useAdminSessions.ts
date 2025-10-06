import { useEffect, useState } from 'react';
import { getAdminSessions } from '../services/adminService';
import type { AdminBookingList } from '../types/booking.types';

export const useAdminSessions = (searchQuery?: string, page?: number, pageSize?: number) => {
  const [sessions, setSessions] = useState<AdminBookingList[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdminSessions(searchQuery, page, pageSize)
      .then((data: { sessions: AdminBookingList[], total: number }) => {
        setSessions(data.sessions);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load sessions');
        setLoading(false);
      });
  }, [searchQuery, page, pageSize]);

  return { sessions, total, loading, error };
};