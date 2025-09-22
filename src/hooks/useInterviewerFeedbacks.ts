import { useEffect, useState } from "react";
import { listInterviewerFeedbacks } from "@/services/interviewerService";
import { FeedbackResponseData } from "@/types/feedback.types";

interface UseInterviewerFeedbacksReturn{
    feedbacks:FeedbackResponseData[];
    loading:boolean;
    error:string | null;
    refetch:()=>Promise<void>;
}

export const useInterviewerFeedbacks=():UseInterviewerFeedbacksReturn=>{
    const [feedbacks, setFeedbacks]=useState<FeedbackResponseData[]>([])
    const [loading,setLoading]=useState<boolean>(true)
    const [error,setError]=useState<string|null>(null)

    const fetchFeedbacks=async()=>{
        setLoading(true)
        setError(null)
        try {
            const data = await listInterviewerFeedbacks();
      setFeedbacks(data);
        } catch (error:any) {
            console.error("Error fetching feedbacks:", error);
      setError(error?.response?.data?.error || "Failed to fetch feedbacks");
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchFeedbacks()
    },[])

    return { feedbacks,loading,error, refetch:fetchFeedbacks}
}