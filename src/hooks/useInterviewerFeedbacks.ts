import { useEffect, useState } from "react";
import { listInterviewerFeedbacks } from "@/services/interviewerService";
import { FeedbackResponseData,PaginatedFeedbackResponse } from "@/types/feedback.types";

interface UseInterviewerFeedbacksReturn{
    feedbacks: FeedbackResponseData[] | null;
    pagination: PaginatedFeedbackResponse['pagination'] | null;
    loading:boolean;
    error:string | null;
}

export const useInterviewerFeedbacks = (page: number, limit: number, searchTerm: string, sortBy: string): UseInterviewerFeedbacksReturn => {
    const [data, setData] = useState<PaginatedFeedbackResponse | null>(null);
    const [loading,setLoading]=useState<boolean>(true)
    const [error,setError]=useState<string|null>(null)

    const fetchFeedbacks=async()=>{
        setLoading(true)
        setError(null)
        try {
            const response = await listInterviewerFeedbacks(page, limit, searchTerm, sortBy);
            setData(response);
        } catch (error:any) {
            console.error("Error fetching feedbacks:", error);
            setError(error?.response?.data?.error || "Failed to fetch feedbacks");
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchFeedbacks()
    },[page, limit, searchTerm, sortBy])

    return { 
       feedbacks: data?.data ?? [], 
       pagination: data?.pagination ?? null, 
       loading, 
       error 
   }
}