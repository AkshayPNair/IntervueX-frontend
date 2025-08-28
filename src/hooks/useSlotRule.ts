import { useState,useEffect,useCallback } from "react";
import {toast} from 'sonner'
import { saveSlotRule,getSlotRule } from "../services/slotRuleService";
import { DaySlotRule,SaveSlotRuleData,SlotRuleResponse } from "../types/slotRule.types";

const getDefaultSlotRules = (): DaySlotRule[] => [
  { day: 'Sun', startTime: '', endTime: '', bufferTime: 15, enabled: false },
  { day: 'Mon', startTime: '', endTime: '', bufferTime: 15, enabled: false },
  { day: 'Tue', startTime: '', endTime: '', bufferTime: 15, enabled: false },
  { day: 'Wed', startTime: '', endTime: '', bufferTime: 15, enabled: false },
  { day: 'Thu', startTime: '', endTime: '', bufferTime: 15, enabled: false },
  { day: 'Fri', startTime: '', endTime: '', bufferTime: 15, enabled: false },
  { day: 'Sat', startTime: '', endTime: '', bufferTime: 15, enabled: false }
];

export const useSlotRule = () => {
  const [slotRules, setSlotRules] = useState<DaySlotRule[]>(getDefaultSlotRules());
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slotRuleId, setSlotRuleId] = useState<string>('');

  // Load slot rules on mount
  useEffect(() => {
    loadSlotRules();
  }, []);

  const loadSlotRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSlotRule();
      if (response) {
        setSlotRules(response.slotRules);
        setBlockedDates(response.blockedDates);
        setSlotRuleId(response.id);
      }
    } catch (error: any) {
      // If no slot rules exist, keep default values
      console.log('No slot rules found, using defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSlotRules = useCallback(async () => {
    // Validate active days
    const activeDays = slotRules.filter(rule => 
      rule.enabled && rule.startTime && rule.endTime
    );

    if (activeDays.length === 0) {
      toast.error('No active days configured', {
        description: 'Please enable and configure at least one day with complete timing.'
      });
      return false;
    }

    // Validate each active day
    for (const rule of activeDays) {
      if (!isValidTimeRange(rule.startTime, rule.endTime)) {
        toast.error(`Invalid time range for ${rule.day}`, {
          description: 'Start time must be before end time'
        });
        return false;
      }

      if (rule.bufferTime < 0 || rule.bufferTime > 60) {
        toast.error(`Invalid buffer time for ${rule.day}`, {
          description: 'Buffer time must be between 0 and 60 minutes'
        });
        return false;
      }
    }

    // Validate blocked dates
    for (const date of blockedDates) {
      if (!isValidDateFormat(date)) {
        toast.error('Invalid blocked date format', {
          description: 'Please use YYYY-MM-DD format'
        });
        return false;
      }
    }

    setSaving(true);
    try {
        const normalizedSlotRules = slotRules.map(rule => {
        if (rule.enabled) return rule;
        return {
          ...rule,
          // Provide valid HH:MM values for disabled days to pass Mongoose schema
          startTime: rule.startTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(rule.startTime) ? rule.startTime : '00:00',
          endTime: rule.endTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(rule.endTime) ? rule.endTime : '00:00',
          bufferTime: typeof rule.bufferTime === 'number' ? rule.bufferTime : 0,
        };
      });

      const saveData: SaveSlotRuleData = {
        slotRules:normalizedSlotRules,
        blockedDates
      };

      // This single API call handles both create and update
      const response = await saveSlotRule(saveData);
      setSlotRuleId(response.id);
      
      const isFirstTime = !slotRuleId;
      toast.success(
        isFirstTime ? 'Slot rules created successfully!' : 'Slot rules updated successfully!', 
        {
          description: `Configured ${activeDays.length} day(s) and ${blockedDates.length} blocked date(s).`
        }
      );
      
      return true;
    } catch (error: any) {
      toast.error('Failed to save slot rules', {
        description: error.response?.data?.error || error.message
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [slotRules, blockedDates, slotRuleId]);

  const updateSlotRule = useCallback((dayIndex: number, field: keyof DaySlotRule, value: string | number | boolean) => {
    setSlotRules(prev => prev.map((rule, index) =>
      index === dayIndex ? { ...rule, [field]: value } : rule
    ));
  }, []);

  const addBlockedDate = useCallback((date: string) => {
    if (!date) {
      toast.error('Please select a date');
      return false;
    }

    if (!isValidDateFormat(date)) {
      toast.error('Invalid date format');
      return false;
    }

    if (blockedDates.includes(date)) {
      toast.error('This date is already blocked');
      return false;
    }

    // Check if date is in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Cannot block past dates');
      return false;
    }

    setBlockedDates(prev => [...prev, date]);
    toast.success('Date blocked successfully');
    return true;
  }, [blockedDates]);

  const removeBlockedDate = useCallback((date: string) => {
    setBlockedDates(prev => prev.filter(d => d !== date));
    toast.info('Date unblocked');
  }, []);

  const resetSlotRules = useCallback(() => {
    setSlotRules(getDefaultSlotRules());
    setBlockedDates([]);
    setSlotRuleId('');
    toast.info('Slot rules reset', {
      description: 'All configurations have been cleared.'
    });
  }, []);

  const getActiveDaysCount = useCallback(() => {
    return slotRules.filter(rule => rule.enabled && rule.startTime && rule.endTime).length;
  }, [slotRules]);

  const getTotalAvailableHours = useCallback(() => {
    return slotRules.reduce((total, rule) => {
      if (rule.enabled && rule.startTime && rule.endTime) {
        return total + calculateAvailableHours(rule.startTime, rule.endTime);
      }
      return total;
    }, 0);
  }, [slotRules]);

  return {
    // State
    slotRules,
    blockedDates,
    loading,
    saving,
    slotRuleId,
    
    // Actions
    updateSlotRule,
    addBlockedDate,
    removeBlockedDate,
    saveSlotRules, // This handles both create and update
    resetSlotRules,
    loadSlotRules,
    
    // Computed values
    activeDaysCount: getActiveDaysCount(),
    totalAvailableHours: getTotalAvailableHours()
  };
};

// Helper functions
const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return startMinutes < endMinutes;
};

const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

const isValidDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

const calculateAvailableHours = (startTime: string, endTime: string): number => {
  if (!isValidTimeRange(startTime, endTime)) {
    return 0;
  }
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return (endMinutes - startMinutes) / 60;
};