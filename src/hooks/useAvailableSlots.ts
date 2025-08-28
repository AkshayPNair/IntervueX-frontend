import { useState,useEffect } from "react";
import { getAvailableSlots } from "../services/slotRuleService";
import { AvailableSlotResponse } from "../types/slotRule.types";

interface UseAvailableSlotsProps{
    interviewerId:string;
    selectedDate:string;
}

interface UseAvailableSlotsReturn{
    availableSlots:AvailableSlotResponse|null;
    loading:boolean;
    error:string|null;
    refetch:()=> Promise<void>
}

export const useAvailableSlots=({
    interviewerId,
    selectedDate
}:UseAvailableSlotsProps):UseAvailableSlotsReturn=>{
    const [availableSlots, setAvailableSlots] = useState<AvailableSlotResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAvailableSlots = async () => {
        if (!interviewerId || !selectedDate) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getAvailableSlots(interviewerId, selectedDate);
            setAvailableSlots(response);
        } catch (err: any) {
            console.error('Error fetching available slots:', err);
            setError(err.response?.data?.error || 'Failed to fetch available slots');
            setAvailableSlots(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (interviewerId && selectedDate) {
            fetchAvailableSlots();
        }
    }, [interviewerId, selectedDate]);

   return {
        availableSlots,
        loading,
        error,
        refetch: fetchAvailableSlots
    };
};
