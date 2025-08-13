import api from './api'
import { SaveSlotRuleData,SlotRuleResponse } from '../types/slotRule.types'

export const saveSlotRule=async(data:SaveSlotRuleData):Promise<SlotRuleResponse>=>{
    const response=await api.post('/interviewer/slot-rules',data);
    return response.data
}

export const getSlotRule=async():Promise<SlotRuleResponse>=>{
    const response=await api.get('/interviewer/slot-rules');
    return response.data
}