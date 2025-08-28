import api from './api'
import { SaveSlotRuleData,SlotRuleResponse,AvailableSlotResponse, } from '../types/slotRule.types'

export const saveSlotRule=async(data:SaveSlotRuleData):Promise<SlotRuleResponse>=>{
    const response=await api.post('/interviewer/slot-rules',data);
    return response.data
}

export const getSlotRule=async():Promise<SlotRuleResponse>=>{
    const response=await api.get('/interviewer/slot-rules');
    return response.data
}

export const getAvailableSlots=async(interviewerId:string,selectedDate:string):Promise<AvailableSlotResponse>=>{
    const response=await api.get(`/user/book-session/${interviewerId}?selectedDate=${selectedDate}`);
    return response.data
}