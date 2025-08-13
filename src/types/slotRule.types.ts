export interface DaySlotRule{
    day:string;
    startTime:string;
    endTime:string;
    bufferTime:number;
    enabled:boolean;
}

export interface SaveSlotRuleData{
    slotRules:DaySlotRule[];
    blockedDates:string[];
}

export interface SlotRuleResponse{
    id:string;
    interviewerId:string;
    slotRules:DaySlotRule[];
    blockedDates:string[];
    createdAt:string;
    updatedAt:string;
}