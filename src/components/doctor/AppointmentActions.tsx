"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, CheckCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AppointmentActionsProps {
    appointmentId: string;
    status: string;
}

export default function AppointmentActions({ appointmentId, status }: AppointmentActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const updateStatus = async (newStatus: string, reason?: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, cancelReason: reason }),
            });

            if (response.ok) {
                toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
                router.refresh(); // Refresh server component
            } else {
                toast.error("Failed to update appointment");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
            setDialogOpen(false);
        }
    };

    if (status === "PENDING") {
        return (
            <div className="flex space-x-2">
                <Button
                    size="sm"
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => updateStatus("CONFIRMED")}
                    disabled={loading}
                >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <X className="h-4 w-4 mr-1" />
                            Decline
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Decline Appointment</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for declining this appointment.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="Reason for cancellation..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={() => updateStatus("CANCELLED", cancelReason)}
                                disabled={!cancelReason.trim() || loading}
                            >
                                Decline
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    if (status === "CONFIRMED") {
        return (
            <div className="flex space-x-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => updateStatus("COMPLETED")}
                    disabled={loading}
                >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Complete
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                            Cancel
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cancel Appointment</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for cancelling this appointment.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="Reason for cancellation..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Back</Button>
                            <Button
                                variant="destructive"
                                onClick={() => updateStatus("CANCELLED", cancelReason)}
                                disabled={!cancelReason.trim() || loading}
                            >
                                Cancel Appointment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return null;
}
