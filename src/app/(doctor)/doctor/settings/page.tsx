'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, User, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

interface DoctorProfile {
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    about: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    user: {
        email: string;
        phone: string | null;
    };
}

export default function DoctorSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/doctor/profile');
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data.doctor);
                }
            } catch (error) {
                console.error('Failed to load profile', error);
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    const handleChange = (key: keyof DoctorProfile, value: any) => {
        if (!profile) return;
        setProfile({ ...profile, [key]: value });
    };

    const handleSave = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/doctor/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    about: profile.about,
                    address: profile.address,
                    city: profile.city,
                    state: profile.state,
                    zipCode: profile.zipCode,
                    consultationFee: profile.consultationFee,
                    experience: profile.experience,
                    qualification: profile.qualification,
                }),
            });

            if (!response.ok) throw new Error('Failed to update profile');
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pt-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500">Manage your professional information and account details.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Professional Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-teal-600" />
                            Professional Details
                        </CardTitle>
                        <CardDescription>Your public professional information.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Full Name (Read-only)</Label>
                            <Input disabled value={`Dr. ${profile.firstName} ${profile.lastName}`} />
                        </div>
                        <div className="space-y-2">
                            <Label>Specialization (Read-only)</Label>
                            <Input disabled value={profile.specialization} />
                        </div>
                        <div className="space-y-2">
                            <Label>License Number (Read-only)</Label>
                            <Input disabled value={profile.licenseNumber} />
                        </div>
                        <div className="space-y-2">
                            <Label>Experience (Years)</Label>
                            <Input
                                type="number"
                                value={profile.experience}
                                onChange={(e) => handleChange('experience', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Qualification</Label>
                            <Input
                                value={profile.qualification}
                                onChange={(e) => handleChange('qualification', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Consultation Fee ($)
                            </Label>
                            <Input
                                type="number"
                                value={profile.consultationFee}
                                onChange={(e) => handleChange('consultationFee', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>About Bio</Label>
                            <Textarea
                                rows={4}
                                value={profile.about || ''}
                                onChange={(e) => handleChange('about', e.target.value)}
                                placeholder="Tell patients about your practice..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-teal-600" />
                            Location & Contact
                        </CardTitle>
                        <CardDescription>Where patients can find your clinic.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2 space-y-2">
                            <Label>Street Address</Label>
                            <Input
                                value={profile.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="123 Medical Center Dr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                                value={profile.city || ''}
                                onChange={(e) => handleChange('city', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>State</Label>
                            <Input
                                value={profile.state || ''}
                                onChange={(e) => handleChange('state', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Zip Code</Label>
                            <Input
                                value={profile.zipCode || ''}
                                onChange={(e) => handleChange('zipCode', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email (Read-only)</Label>
                            <Input disabled value={profile.user.email} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pb-8">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-32 bg-teal-600 hover:bg-teal-700"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
