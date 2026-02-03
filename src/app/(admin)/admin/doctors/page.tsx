'use client';

import { useEffect, useState } from 'react';
import {
    Check,
    X,
    Search,
    MoreHorizontal,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminDoctorsPage() {
    const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
    const [allDoctors, setAllDoctors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDoctors = async () => {
        try {
            // Parallel fetch
            const [pendingRes, allRes] = await Promise.all([
                fetch('/api/admin/doctors/pending'),
                fetch('/api/admin/doctors')
            ]);

            if (pendingRes.ok) {
                const data = await pendingRes.json();
                setPendingDoctors(data.doctors || []);
            }

            if (allRes.ok) {
                const data = await allRes.json();
                setAllDoctors(data.doctors || []);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast.error('Failed to load doctors');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleVerification = async (doctorId: string, action: 'approve' | 'reject') => {
        try {
            const response = await fetch('/api/admin/doctors/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId, action }),
            });

            if (!response.ok) throw new Error('Verification failed');

            toast.success(`Doctor ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
            fetchDoctors(); // Refresh lists
        } catch (error) {
            console.error('Error verifying doctor:', error);
            toast.error('Failed to process verification');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Doctor Management</h2>
                    <p className="text-muted-foreground mt-1">
                        Verify licenses and manage doctor profiles
                    </p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-white border">
                    <TabsTrigger value="pending" className="relative">
                        Pending Verification
                        {pendingDoctors.length > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                {pendingDoctors.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="all">All Doctors</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Verifications</CardTitle>
                            <CardDescription>
                                Review and verify doctor licenses. This enables their public profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingDoctors.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                    <ShieldCheck className="w-12 h-12 mb-3 text-green-500" />
                                    <p>All doctors verified! No pending actions.</p>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Doctor Name</TableHead>
                                                <TableHead>Specialization</TableHead>
                                                <TableHead>License Number</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingDoctors.map((doc) => (
                                                <TableRow key={doc.id}>
                                                    <TableCell className="font-medium">
                                                        Dr. {doc.firstName} {doc.lastName}
                                                    </TableCell>
                                                    <TableCell>{doc.specialization}</TableCell>
                                                    <TableCell className="font-mono bg-gray-50 px-2 py-1 rounded w-fit">
                                                        {doc.licenseNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col text-xs text-muted-foreground">
                                                            <span>{doc.user.email}</span>
                                                            <span>{doc.user.phone}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleVerification(doc.id, 'reject')}
                                                            >
                                                                <X className="w-4 h-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleVerification(doc.id, 'approve')}
                                                            >
                                                                <Check className="w-4 h-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Doctor Directory</CardTitle>
                                    <CardDescription>List of all registered doctors.</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search doctors..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Specialization</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Appointments</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead className="text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allDoctors.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium">
                                                    Dr. {doc.firstName} {doc.lastName}
                                                </TableCell>
                                                <TableCell>{doc.specialization}</TableCell>
                                                <TableCell>
                                                    {doc.licenseVerified ? (
                                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                            Verified
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{doc._count?.appointments || 0}</TableCell>
                                                <TableCell>{doc.rating.toFixed(1)} ({doc.totalReviews})</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                            <DropdownMenuItem>View Appointments</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600">Suspend Account</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
