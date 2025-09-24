import api from './api'
import { API_ROUTES } from '../constants/apiRoutes';
import { SaveSlotRuleData,SlotRuleResponse,AvailableSlotResponse, } from '../types/slotRule.types'

export const saveSlotRule=async(data:SaveSlotRuleData):Promise<SlotRuleResponse>=>{
    const response=await api.post(API_ROUTES.INTERVIEWER.SAVE_SLOT_RULE,data);
    return response.data
}

export const getSlotRule=async():Promise<SlotRuleResponse>=>{
    const response=await api.get(API_ROUTES.INTERVIEWER.SLOT_RULES);
    return response.data
}

export const getAvailableSlots=async(interviewerId:string,selectedDate:string):Promise<AvailableSlotResponse>=>{
    const response=await api.get(`${API_ROUTES.USER.BOOK_SESSION(interviewerId)}?selectedDate=${selectedDate}`);
    return response.data
}