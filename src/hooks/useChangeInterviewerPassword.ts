import { useState } from 'react'
import { changeInterviewerPassword } from '@/services/interviewerService'
import { ChangePasswordData } from '@/types/auth.types'

interface UseChangePasswordReturn {
  changePassword: (data: ChangePasswordData) => Promise<void>
  loading: boolean
  error: string | null
}

export const useChangeInterviewerPassword = (): UseChangePasswordReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changePassword = async (data: ChangePasswordData) => {
    setLoading(true)
    setError(null)
    try {
      await changeInterviewerPassword(data)
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to change password'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { changePassword, loading, error }
}