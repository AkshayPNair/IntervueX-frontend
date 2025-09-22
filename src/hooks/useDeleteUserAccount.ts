import { useState } from 'react'
import { deleteUserAccount } from '@/services/userService'

interface UseDeleteAccountReturn {
  deleteAccount: () => Promise<void>
  loading: boolean
  error: string | null
}

export const useDeleteUserAccount = (): UseDeleteAccountReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteAccount = async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteUserAccount()
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