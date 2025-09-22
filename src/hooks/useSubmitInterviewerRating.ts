import { useState } from 'react';
import { submitInterviewerRating} from '@/services/userService';
import { SubmitInterviewerRatingData } from '@/types/feedback.types';

interface UseSubmitInterviewerRatingReturn {
  submit: (data: SubmitInterviewerRatingData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useSubmitInterviewerRating = (): UseSubmitInterviewerRatingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: SubmitInterviewerRatingData) => {
    setLoading(true);
    setError(null);
    try {
      await submitInterviewerRating(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit rating');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
};