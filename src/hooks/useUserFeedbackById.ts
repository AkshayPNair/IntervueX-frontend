import { useEffect, useState } from 'react'
import { getUserFeedbackById } from '@/services/userService'
import { FeedbackResponseData } from '@/types/feedback.types'

interface UseUserFeedbackByIdReturn {
  feedback: FeedbackResponseData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useUserFeedbackById = (id: string | null): UseUserFeedbackByIdReturn => {
  const [feedback, setFeedback] = useState<FeedbackResponseData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFeedback = async () => {
    if (!id) {
      setFeedback(null)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getUserFeedbackById(id)
      setFeedback(data)
    } catch (err: any) {
      console.error('Error fetching user feedback by id:', err)
      setError(err?.response?.data?.error || 'Failed to fetch feedback details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [id])

  return { feedback, loading, error, refetch: fetchFeedback }
}