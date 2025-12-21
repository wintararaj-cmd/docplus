"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    Clock,
    MessageSquare,
    LogOut,
    Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    {
        name: "Dashboard",
        href: "/doctor/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Appointments",
        href: "/doctor/appointments",
        icon: Calendar,
    },
    {
        name: "Patients",
        href: "/doctor/patients",
        icon: Users,
    },
    {
        name: "Prescriptions",
        href: "/doctor/prescriptions",
        icon: FileText,
    },
    {
        name: "Schedule",
        href: "/doctor/schedule",
        icon: Clock,
    },
    {
        name: "Chat",
        href: "/doctor/chat",
        icon: MessageSquare,
    },
];

export default function DoctorNav() {
    const pathname = usePathname();

    const handleLogout = async () => {
        // TODO: Implement logout
        window.location.href = "/login";
    };

    return (
        <nav className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8" />
                        <span className="font-bold text-xl">Doctor Portal</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isActive
                                            ? "bg-white/20 backdrop-blur-sm"
                                            : "hover:bg-white/10"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Logout Button */}
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="hidden md:flex items-center space-x-2 text-white hover:bg-white/10"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </Button>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-4">
                    <div className="grid grid-cols-3 gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${isActive
                                            ? "bg-white/20 backdrop-blur-sm"
                                            : "hover:bg-white/10"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-xs font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
