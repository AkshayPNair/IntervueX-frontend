import { useState } from 'react'
import { deleteInterviewerAccount } from '@/services/interviewerService'

interface UseDeleteAccountReturn {
  deleteAccount: () => Promise<void>
  loading: boolean
  error: string | null
}

export const useDeleteInterviewerAccount = (): UseDeleteAccountReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteAccount = async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteInterviewerAccount()
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to delete account'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteAccount, loading, error }
}