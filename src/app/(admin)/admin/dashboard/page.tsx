'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    Stethoscope,
    Calendar,
    DollarSign,
    TrendingUp,
    Activity,
    ArrowRight,
    Loader2
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface DashboardStats {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    todaysAppointments: number;
    pendingDoctors: number;
    monthlyRevenue: number;
}

interface RecentUser {
    id: string;
    email: string;
    role: string;
    name: string;
    createdAt: string;
}

// Mock chart data - in phase 7 we can make this real
const data = [
    { name: 'Jan', value: 2400 },
    { name: 'Feb', value: 1398 },
    { name: 'Mar', value: 9800 },
    { name: 'Apr', value: 3908 },
    { name: 'May', value: 4800 },
    { name: 'Jun', value: 3800 },
    { name: 'Jul', value: 4300 },
];

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('/api/admin/analytics');
                if (!response.ok) throw new Error('Failed to fetch analytics');
                const data = await response.json();
                setStats(data.stats);
                setRecentUsers(data.recentUsers);
            } catch (error) {
                console.error('Error loading dashboard:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                <p className="text-muted-foreground mt-1">
                    Overview of your medical practice's performance
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalPatients}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                        <Stethoscope className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalDoctors}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                                {stats?.pendingDoctors} Verification Pending
                            </p>
                            {stats?.pendingDoctors ? (
                                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Action Needed</Badge>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalAppointments}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.todaysAppointments} scheduled for today
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${stats?.monthlyRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Calculated from completed appointments
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>
                            Monthly revenue from consultation fees
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                        <CardDescription>
                            Latest users joining the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentUsers.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                            ) : (
                                recentUsers.map((user) => (
                                    <div key={user.id} className="flex items-center">
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center border
                      ${user.role === 'DOCTOR' ? 'bg-green-100 border-green-200' : 'bg-blue-100 border-blue-200'}
                    `}>
                                            {user.role === 'DOCTOR' ? (
                                                <Stethoscope className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <User className="h-4 w-4 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-gray-500">
                                            {format(new Date(user.createdAt), 'MMM d, h:mm a')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t">
                            <Button variant="outline" className="w-full text-xs" asChild>
                                <a href="/admin/users" className="flex items-center gap-2">
                                    View All Users <ArrowRight className="h-3 w-3" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Needed for Lucide icon in map
function User(props: any) {
    return <Users {...props} />
}
