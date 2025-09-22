import { useState } from "react";
import { submitFeedback as submitFeedbackService } from "@/services/interviewerService";
import { SubmitFeedbackData } from "@/types/feedback.types";

interface UseSubmitFeedbackReturn {
    submitFeedback: (data: SubmitFeedbackData) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useSubmitFeedback = (): UseSubmitFeedbackReturn => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submitFeedback = async (data: SubmitFeedbackData) => {
        setLoading(true)
        setError(null)
        try {
            await submitFeedbackService(data);
        } catch (error: any) {
            console.error("Error submitting feedback:", error);
            setError(error?.response?.data?.error || "Failed to submit feedback");
            throw error;
        } finally {
            setLoading(false)
        }
    }
    return { submitFeedback, loading, error };
}