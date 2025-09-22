import { useEffect, useState } from 'react'
import { UserDashboardResponse } from '@/types/dashboard.types'
import { getUserDashboard } from '@/services/userService'

interface UseUserDashboardReturn extends UserDashboardResponse {
    loading: Boolean
    error: string | null
    refetch: () => Promise<void>
}

export const useUserDashboard = (): UseUserDashboardReturn => {
    const [data, setData] = useState<UserDashboardResponse>({
        stats: { totalInterviews: 0, averageRating: 0, successRate: 0, hoursPracticed: 0 },
        upcomingSessions: [],
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAll = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getUserDashboard()
            setData(res)
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAll()
    }, [])

    return { ...data, loading, error, refetch: fetchAll }

}