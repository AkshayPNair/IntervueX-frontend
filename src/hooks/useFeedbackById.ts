import { useEffect,useState } from "react";
import { getFeedbackById } from "@/services/interviewerService";
import { FeedbackResponseData } from "@/types/feedback.types";

interface UseFeedbackByIdReturn{
    feedback:FeedbackResponseData|null;
    loading:boolean;
    error:string|null;
    refetch:()=> Promise<void>;
}

export const useFeedbackById=(id:string|null):UseFeedbackByIdReturn =>{
    const [feedback, setFeedback]=useState<FeedbackResponseData | null>(null)
    const [loading,setLoading]=useState<boolean>(false)
    const [error,setError]=useState<string | null>(null)

    const fetchFeedback=async()=>{
        if(!id){
            setFeedback(null)
            setLoading(false)
            setError(null)
            return;
        }
        setLoading(true)
        setError(null)
        try {
            const data = await getFeedbackById(id);
      setFeedback(data);
        } catch (error:any) {
            console.error("Error fetching feedback by id:", error);
      setError(error?.response?.data?.error || "Failed to fetch feedback details");
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchFeedback()
    },[id])
    return { feedback, loading, error, refetch: fetchFeedback };
}