"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
    Shield,
    Stethoscope,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

type User = {
    id: string;
    email: string;
    phone: string | null;
    role: string;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    patient?: {
        firstName: string;
        lastName: string;
    };
    doctor?: {
        firstName: string;
        lastName: string;
        specialization: string;
        licenseVerified: boolean;
    };
};

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            } else {
                toast.error("Failed to load users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter((user) => {
                const name = user.patient
                    ? `${user.patient.firstName} ${user.patient.lastName}`
                    : user.doctor
                        ? `${user.doctor.firstName} ${user.doctor.lastName}`
                        : "";
                return (
                    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            });
        }

        // Role filter
        if (roleFilter !== "ALL") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter === "ACTIVE") {
            filtered = filtered.filter((user) => user.isActive);
        } else if (statusFilter === "INACTIVE") {
            filtered = filtered.filter((user) => !user.isActive);
        }

        setFilteredUsers(filtered);
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? "deactivate" : "activate";
        if (!confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        setProcessing(userId);
        try {
            const response = await fetch("/api/admin/users/toggle-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isActive: !currentStatus }),
            });

            if (response.ok) {
                toast.success(`User ${action}d successfully`);
                fetchUsers();
            } else {
                const error = await response.json();
                toast.error(error.message || `Failed to ${action} user`);
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
            toast.error("An error occurred");
        } finally {
            setProcessing(null);
        }
    };

    const getUserName = (user: User) => {
        if (user.patient) {
            return `${user.patient.firstName} ${user.patient.lastName}`;
        }
        if (user.doctor) {
            return `Dr. ${user.doctor.firstName} ${user.doctor.lastName}`;
        }
        return user.email;
    };

    const getRoleBadge = (role: string) => {
        const badges = {
            PATIENT: "bg-blue-100 text-blue-700",
            DOCTOR: "bg-emerald-100 text-emerald-700",
            ADMIN: "bg-red-100 text-red-700",
        };
        return badges[role as keyof typeof badges] || "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
                <p className="text-gray-600 mt-1">
                    Manage all users in the system
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="PATIENT">Patients</option>
                            <option value="DOCTOR">Doctors</option>
                            <option value="ADMIN">Admins</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold">{users.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold">
                                    {users.filter((u) => u.isActive).length}
                                </p>
                            </div>
                            <UserCheck className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold">
                                    {users.filter((u) => !u.isActive).length}
                                </p>
                            </div>
                            <UserX className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Filtered</p>
                                <p className="text-2xl font-bold">{filteredUsers.length}</p>
                            </div>
                            <Filter className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-semibold">User</th>
                                    <th className="text-left p-4 font-semibold">Role</th>
                                    <th className="text-left p-4 font-semibold">Contact</th>
                                    <th className="text-left p-4 font-semibold">Status</th>
                                    <th className="text-left p-4 font-semibold">Joined</th>
                                    <th className="text-left p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-semibold">{getUserName(user)}</p>
                                                {user.doctor && (
                                                    <p className="text-xs text-gray-500">
                                                        {user.doctor.specialization}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <div className="flex items-center space-x-1">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    <span>{user.email}</span>
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center space-x-1 text-gray-500">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{user.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </span>
                                                {user.emailVerified && (
                                                    <div className="flex items-center space-x-1 text-xs text-green-600">
                                                        <UserCheck className="h-3 w-3" />
                                                        <span>Verified</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <Button
                                                size="sm"
                                                variant={user.isActive ? "outline" : "default"}
                                                onClick={() => toggleUserStatus(user.id, user.isActive)}
                                                disabled={processing === user.id}
                                                className={
                                                    user.isActive
                                                        ? "border-red-600 text-red-600 hover:bg-red-50"
                                                        : "bg-green-600 hover:bg-green-700"
                                                }
                                            >
                                                {processing === user.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : user.isActive ? (
                                                    "Deactivate"
                                                ) : (
                                                    "Activate"
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No users found</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
