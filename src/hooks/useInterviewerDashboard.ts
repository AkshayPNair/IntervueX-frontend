import { useEffect, useState } from 'react'
import { InterviewerDashboardResponse } from '@/types/dashboard.types'
import { getInterviewerDashboard } from '@/services/interviewerService'

interface UseInterviewerDashboardReturn extends InterviewerDashboardResponse {
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useInterviewerDashboard = (): UseInterviewerDashboardReturn => {
  const [data, setData] = useState<InterviewerDashboardResponse>({
    stats: { totalInterviews: 0, averageRating: 0, successRate: 0, hoursConducted: 0 },
    upcomingSessions: [],
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getInterviewerDashboard()
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