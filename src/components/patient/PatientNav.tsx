'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    User,
    LogOut,
    Bell,
    MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface PatientNavProps {
    user: {
        name?: string | null
        email?: string | null
    }
}

const navItems = [
    { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { href: '/patient/doctors', label: 'Find Doctors', icon: Users },
    { href: '/patient/medical-records', label: 'Medical Records', icon: FileText },
    { href: '/patient/chat', label: 'Messages', icon: MessageSquare },
]

export default function PatientNav({ user }: PatientNavProps) {
    const pathname = usePathname()

    const getInitials = (name?: string | null) => {
        if (!name) return 'P'
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/patient/dashboard" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">H+</span>
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            HealthCare
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Button>

                        <div className="flex items-center space-x-3">
                            <Avatar>
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-900">{user.name || 'Patient'}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5 text-gray-600" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex overflow-x-auto space-x-2 pb-3 -mx-4 px-4">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
