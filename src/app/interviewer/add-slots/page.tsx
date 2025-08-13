"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ParticleBackground from "@/components/ui/ParticleBackground";
import {
  Clock,
  RotateCcw,
  CheckCircle,
  X,
  Loader2,
  Calendar,
  Timer,
  Settings
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSlotRule } from "../../../hooks/useSlotRule";
import { DaySlotRule } from "../../../types/slotRule.types";

const AddSlots = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [newBlockedDate, setNewBlockedDate] = useState<string>("");

  const {
    slotRules,
    blockedDates,
    loading,
    saving,
    updateSlotRule,
    addBlockedDate,
    removeBlockedDate,
    saveSlotRules,
    resetSlotRules,
    activeDaysCount,
    totalAvailableHours
  } = useSlotRule();

  const dayNames = {
    "Sun": "Sunday",
    "Mon": "Monday",
    "Tue": "Tuesday",
    "Wed": "Wednesday",
    "Thu": "Thursday",
    "Fri": "Friday",
    "Sat": "Saturday"
  };

  const handleAddBlockedDate = () => {
    if (addBlockedDate(newBlockedDate)) {
      setNewBlockedDate("");
    }
  };

  const handleSave = async () => {
    await saveSlotRules()
  };

  const handleReset = async () => {
    await resetSlotRules();
  }


// ✅ Generate preview slots with 60min interviews + buffer after each
const previewSlots = useMemo(() => {
  const currentRule = slotRules[selectedDay];
  if (!currentRule.enabled || !currentRule.startTime || !currentRule.endTime) return [];

  const INTERVIEW_DURATION = 60; // fixed 60 minutes
  const buffer = currentRule.bufferTime;

  const slots: string[] = [];
  let current = new Date(`1970-01-01T${currentRule.startTime}:00`);
  const end = new Date(`1970-01-01T${currentRule.endTime}:00`);

  while (true) {
    const interviewEnd = new Date(current.getTime() + INTERVIEW_DURATION * 60000);
    if (interviewEnd > end) break;

    slots.push(
      `${current.toTimeString().slice(0, 5)} - ${interviewEnd.toTimeString().slice(0, 5)}`
    );

    // Move to next slot: interview time + buffer
    current = new Date(interviewEnd.getTime() + buffer * 60000);
  }

  return slots;
}, [slotRules, selectedDay]);

if (loading) {
    return (
      <div className="min-h-screen gradient-bg relative flex items-center justify-center">
        <ParticleBackground />
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading slot rules...</span>
        </div>
      </div>
    );
  }

return (
  <div className="min-h-screen gradient-bg relative">
    <ParticleBackground />

    <main className="container mx-auto px-6 py-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient-static mb-2">Add Slots</h1>
        <p className="text-purple-300 text-lg">Configure your weekly availability schedule</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="card-futuristic p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 glow-button rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-600/20">
              <Clock className="w-6 h-6 text-white-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient-static">Weekly Schedule Configuration</h2>
              <p className="text-purple-300">Set your availability for each day of the week</p>
            </div>
          </div>

          {/* Day Selector */}
          <div className="flex justify-center gap-3 mb-4">
          {slotRules.map((day, index) => (
              <button
                key={day.day}
                className={cn(
                  "w-16 h-16 rounded-2xl transition-all duration-300 border",
                  selectedDay === index
                    ? "glow-button text-white shadow-lg"
                    : "glass-effect border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/10",
                  day.enabled && "border-green-500/50"
                )}
                onClick={() => setSelectedDay(index)}
              >
                <div className="text-center">
                  <div className="text-sm font-medium">{day.day}</div>
                  {day.enabled && (
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Day Configuration */}
          <div className={cn(
            "card-futuristic p-6 rounded-2xl transition-all duration-300 mt-8",
            slotRules[selectedDay].enabled
              ? "border-green-500/30 shadow-green-500/10"
              : "border-purple-500/20"
          )}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  slotRules[selectedDay].enabled
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                )}>
                  <Clock className="w-6 h-6 " />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gradient-static">
                  {dayNames[slotRules[selectedDay].day as keyof typeof dayNames]}
                  </h3>
                  <p className="text-purple-300">
                    {slotRules[selectedDay].startTime && slotRules[selectedDay].endTime
                        ? `${slotRules[selectedDay].startTime} - ${slotRules[selectedDay].endTime}`
                      : 'Not configured'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "px-3 py-1 rounded-xl font-medium",
                    slotRules[selectedDay].enabled
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  )}
                >
                 {slotRules[selectedDay].enabled ? "Available" : "Unavailable"}
                </Badge>
                <Switch
                  checked={slotRules[selectedDay].enabled}
                  onCheckedChange={(checked) => updateSlotRule(selectedDay, 'enabled', checked)}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-purple-300 font-medium">Start Time</Label>
                <Input
                  type="time"
                  value={slotRules[selectedDay].startTime}
                  onChange={(e) => updateSlotRule(selectedDay, 'startTime', e.target.value)}
                  className="glass-effect border-purple-500/30 text-white h-12 rounded-xl focus:border-purple-400/50 focus:ring-purple-400/20"
                  disabled={!slotRules[selectedDay].enabled}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-300 font-medium">End Time</Label>
                <Input
                  type="time"
                  value={slotRules[selectedDay].endTime}
                  onChange={(e) => updateSlotRule(selectedDay, 'endTime', e.target.value)}
                  className="glass-effect border-purple-500/30 text-white h-12 rounded-xl focus:border-purple-400/50 focus:ring-purple-400/20"
                  disabled={!slotRules[selectedDay].enabled}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-300 font-medium">Buffer (mins)</Label>
                <Input
                  type="number"
                  value={slotRules[selectedDay].bufferTime}
                  onChange={(e) => updateSlotRule(selectedDay, 'bufferTime', Number(e.target.value))}
                  className="glass-effect border-purple-500/30 text-white h-12 rounded-xl focus:border-purple-400/50 focus:ring-purple-400/20"
                  min={5}
                  max={60}
                  disabled={!slotRules[selectedDay].enabled}
                />
              </div>
            </div>

            {/* Preview Slots */}
            {previewSlots.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gradient-static mb-4">Preview Slots</h3>
                <div className="flex flex-wrap gap-3">
                  {previewSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-blue-500/10 border border-blue-400/30 rounded-lg text-blue-300 shadow-sm hover:bg-blue-500/20 transition-colors"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Blocked Dates */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gradient-static mb-4">Blocked Dates</h3>
            <div className="flex gap-4 mb-4">
              <Input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="glass-effect border-purple-500/30 text-white h-12 rounded-xl"
              />
              <Button onClick={handleAddBlockedDate}>Add</Button>
            </div>
            {blockedDates.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {blockedDates.map(date => (
                  <Badge
                    key={date}
                    className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-2"
                  >
                    {date}
                    <X
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => removeBlockedDate(date)}
                    />
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-purple-300">No blocked dates added</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8">
            <Button onClick={handleSave} size="default">
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Schedule
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="default"
              className="glass-effect border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all duration-300 hover:scale-105"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>
      </div>
    </main>
  </div>
);
};

export default AddSlots;
