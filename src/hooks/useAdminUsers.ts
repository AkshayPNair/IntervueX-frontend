import {useEffect, useState} from 'react';
import {fetchAllUsers} from '../services/adminService';
import { AdminUserList } from '../types/auth.types';

export const useAdminUsers=()=>{
    const [users,setUsers]=useState<AdminUserList[]>([])
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState<string | null>(null)

    useEffect(()=>{
        setLoading(true)
        fetchAllUsers()
          .then((users:AdminUserList[])=>{
            setUsers(users)
            setLoading(false);
          })
          .catch((err)=>{
            setError(err.response?.data?.message || 'Failed to fetch users')
            setLoading(false)
          })
    },[])

    return {users , loading, error}
}