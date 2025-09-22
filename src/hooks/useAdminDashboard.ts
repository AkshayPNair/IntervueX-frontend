import { useEffect, useState } from 'react'
import { getAdminDashboard } from '@/services/adminService'
import { AdminDashboardResponse,} from '@/types/dashboard.types'

interface UseAdminDashboardReturn extends AdminDashboardResponse {
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const [data, setData] = useState<AdminDashboardResponse>({
    stats: {
      totalUsers: 0,
      activeSessions: 0,
      pendingRequests: 0,
      totalInterviews: 0,
      totalCompilerRequests: 0,
      totalRevenue: 0,
      monthlyGrowth: { users: 0, interviews: 0, revenue: 0 },
    },
    recentActivity: [],
    sessionSeries: { week: [], month: [], year: [] },
    usersSeries: { week: [], month: [], year: [] },
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminDashboard()
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