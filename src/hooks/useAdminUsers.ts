import {useEffect, useState, useCallback} from 'react';
import {fetchAllUsers} from '../services/adminService';
import { AdminUserList } from '../types/auth.types';

interface PaginatedUsers {
    users: AdminUserList[];
    total: number;
    page: number;
    pageSize: number;
}

export const useAdminUsers=(searchQuery?: string, role?: string, status?: string, page?: number, pageSize?: number)=>{
    const [data,setData]=useState<PaginatedUsers>({users: [], total: 0, page: 1, pageSize: 6})
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState<string | null>(null)

    const fetchUsers = useCallback(() => {
        setLoading(true)
        fetchAllUsers(searchQuery, role, status, page, pageSize)
          .then((result: PaginatedUsers)=>{
            setData(result)
            setLoading(false);
          })
          .catch((err)=>{
            setError(err.response?.data?.message || 'Failed to fetch users')
            setLoading(false)
          })
    }, [searchQuery, role, status, page, pageSize])

    useEffect(()=>{
        fetchUsers()
    },[fetchUsers])

    return {users: data.users, total: data.total, loading, error, refetch: fetchUsers}
}