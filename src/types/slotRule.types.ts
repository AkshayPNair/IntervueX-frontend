export interface DaySlotRule{
    day:string;
    startTime:string;
    endTime:string;
    bufferTime:number;
    enabled:boolean;
}

export interface ExcludedTimeSlot{
    startTime:string;
    endTime:string;
}

export interface SaveSlotRuleData{
    slotRules:DaySlotRule[];
    blockedDates:string[];
    excludedSlotsByDate?: Record<string, ExcludedTimeSlot[]>;
}

export interface SlotRuleResponse{
    id:string;
    interviewerId:string;
    slotRules:DaySlotRule[];
    blockedDates:string[];
    excludedSlotsByDate?: Record<string, ExcludedTimeSlot[]>;
    createdAt:string;
    updatedAt:string;
}

export interface TimeSlot{
    startTime:string;
    endTime:string;
    available:boolean;
}

export interface AvailableSlotResponse{
    date:string;
    weekday:string;
    slots:TimeSlot[];
}