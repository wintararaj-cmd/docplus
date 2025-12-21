"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Clock,
    Plus,
    Trash2,
    Save,
    Calendar,
    AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

type DaySchedule = {
    day: string;
    isAvailable: boolean;
    slots: { startTime: string; endTime: string }[];
};

const DAYS_OF_WEEK = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

export default function ScheduleManagement() {
    const [schedule, setSchedule] = useState<DaySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await fetch("/api/doctor/schedule");
            if (response.ok) {
                const data = await response.json();
                if (data.schedule && data.schedule.length > 0) {
                    setSchedule(data.schedule);
                } else {
                    setSchedule(getDefaultSchedule());
                }
            } else {
                setSchedule(getDefaultSchedule());
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
            setSchedule(getDefaultSchedule());
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    const getDefaultSchedule = (): DaySchedule[] => {
        return DAYS_OF_WEEK.map((day) => ({
            day,
            isAvailable: day !== "SUNDAY",
            slots: day !== "SUNDAY" ? [{ startTime: "09:00", endTime: "17:00" }] : [],
        }));
    };

    const toggleDayAvailability = (dayIndex: number) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].isAvailable = !newSchedule[dayIndex].isAvailable;
        if (!newSchedule[dayIndex].isAvailable) {
            newSchedule[dayIndex].slots = [];
        } else if (newSchedule[dayIndex].slots.length === 0) {
            newSchedule[dayIndex].slots = [{ startTime: "09:00", endTime: "17:00" }];
        }
        setSchedule(newSchedule);
    };

    const addTimeSlot = (dayIndex: number) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].slots.push({ startTime: "09:00", endTime: "17:00" });
        setSchedule(newSchedule);
    };

    const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].slots.splice(slotIndex, 1);
        setSchedule(newSchedule);
    };

    const updateTimeSlot = (
        dayIndex: number,
        slotIndex: number,
        field: "startTime" | "endTime",
        value: string
    ) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].slots[slotIndex][field] = value;
        setSchedule(newSchedule);
    };

    const saveSchedule = async () => {
        setSaving(true);
        try {
            const response = await fetch("/api/doctor/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schedule }),
            });

            if (response.ok) {
                toast.success("Schedule saved successfully!");
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to save schedule");
            }
        } catch (error) {
            console.error("Error saving schedule:", error);
            toast.error("Failed to save schedule");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Schedule Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your availability and working hours
                    </p>
                </div>
                <Button
                    onClick={saveSchedule}
                    disabled={saving}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Schedule"}
                </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">
                                Schedule Guidelines
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Set your availability for each day of the week. You can add multiple time slots per day.
                                Patients will only be able to book appointments during these times.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule Grid */}
            <div className="space-y-4">
                {schedule.map((daySchedule, dayIndex) => (
                    <Card key={daySchedule.day} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-3">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                    <span className="capitalize">
                                        {daySchedule.day.toLowerCase()}
                                    </span>
                                </CardTitle>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={daySchedule.isAvailable}
                                            onChange={() => toggleDayAvailability(dayIndex)}
                                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Available
                                        </span>
                                    </label>
                                    {daySchedule.isAvailable && (
                                        <Button
                                            onClick={() => addTimeSlot(dayIndex)}
                                            size="sm"
                                            variant="outline"
                                            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Slot
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!daySchedule.isAvailable ? (
                                <p className="text-gray-500 text-sm italic">Not available</p>
                            ) : daySchedule.slots.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">
                                    No time slots configured
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {daySchedule.slots.map((slot, slotIndex) => (
                                        <div
                                            key={slotIndex}
                                            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                                        >
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <div className="flex items-center space-x-2 flex-1">
                                                <div className="flex-1">
                                                    <Label className="text-xs text-gray-600">
                                                        Start Time
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={slot.startTime}
                                                        onChange={(e) =>
                                                            updateTimeSlot(
                                                                dayIndex,
                                                                slotIndex,
                                                                "startTime",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-xs text-gray-600">
                                                        End Time
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={slot.endTime}
                                                        onChange={(e) =>
                                                            updateTimeSlot(
                                                                dayIndex,
                                                                slotIndex,
                                                                "endTime",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Save Button (Bottom) */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={saveSchedule}
                    disabled={saving}
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? "Saving..." : "Save Schedule"}
                </Button>
            </div>
        </div>
    );
}
