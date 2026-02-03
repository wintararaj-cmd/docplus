'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Bell, Smartphone, Mail, Globe, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemSettings {
    siteName: string;
    supportEmail: string;
    supportPhone: string;
    enableRegistration: boolean;
    enableChat: boolean;
    maintenanceMode: boolean;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({
        siteName: '',
        supportEmail: '',
        supportPhone: '',
        enableRegistration: true,
        enableChat: true,
        maintenanceMode: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/admin/settings');
                if (response.ok) {
                    const data = await response.json();
                    if (data.settings) setSettings(data.settings);
                }
            } catch (error) {
                console.error('Failed to load settings', error);
                toast.error('Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (key: keyof SystemSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error('Failed to save settings');

            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestNotification = async (type: 'EMAIL' | 'SMS' | 'IN_APP') => {
        setIsTesting(true);
        try {
            const response = await fetch('/api/admin/test-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message: `Test ${type} notification from Admin Panel at ${new Date().toLocaleTimeString()}`,
                    recipientId: 'current-user' // Mock recipient
                }),
            });

            if (!response.ok) throw new Error('Failed to send test');
            const data = await response.json();
            toast.success(data.message);
        } catch (error) {
            console.error('Error testing notification:', error);
            toast.error('Failed to send test notification');
        } finally {
            setIsTesting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                <p className="text-muted-foreground">Manage global configurations and test services.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-500" />
                                General Information
                            </CardTitle>
                            <CardDescription>
                                Basic information about the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={settings.siteName}
                                        onChange={(e) => handleChange('siteName', e.target.value)}
                                        placeholder="Patient Management System"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supportEmail">Support Email</Label>
                                    <Input
                                        id="supportEmail"
                                        value={settings.supportEmail}
                                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                                        placeholder="support@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supportPhone">Support Phone</Label>
                                    <Input
                                        id="supportPhone"
                                        value={settings.supportPhone}
                                        onChange={(e) => handleChange('supportPhone', e.target.value)}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-500" />
                                Feature Toggles & Security
                            </CardTitle>
                            <CardDescription>
                                Enable or disable specific system features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">User Registration</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow new users to create accounts.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.enableRegistration}
                                    onCheckedChange={(c) => handleChange('enableRegistration', c)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Chat System</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable real-time chat between patients and doctors.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.enableChat}
                                    onCheckedChange={(c) => handleChange('enableChat', c)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-red-900">Maintenance Mode</Label>
                                    <p className="text-sm text-red-700">
                                        Disable access for non-admin users.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(c) => handleChange('maintenanceMode', c)}
                                    className="data-[state=checked]:bg-red-600"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving} className="w-32">
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </TabsContent>

                {/* Notifications Testing */}
                <TabsContent value="notifications" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-orange-500" />
                                Notification Tester
                            </CardTitle>
                            <CardDescription>
                                Send test notifications to verify integrations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="p-4 border rounded-lg bg-blue-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Bell className="w-4 h-4 text-blue-600" />
                                        <h3 className="font-semibold text-blue-900">In-App</h3>
                                    </div>
                                    <p className="text-sm text-blue-700 mb-4">
                                        Test the notification bell and toast system.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full bg-white hover:bg-blue-100"
                                        onClick={() => handleTestNotification('IN_APP')}
                                        disabled={isTesting}
                                    >
                                        Send Test Alert
                                    </Button>
                                </div>

                                <div className="p-4 border rounded-lg bg-green-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4 text-green-600" />
                                        <h3 className="font-semibold text-green-900">Email</h3>
                                    </div>
                                    <p className="text-sm text-green-700 mb-4">
                                        Test SMTP / Nodemailer configuration.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full bg-white hover:bg-green-100"
                                        onClick={() => handleTestNotification('EMAIL')}
                                        disabled={isTesting}
                                    >
                                        Send Test Email
                                    </Button>
                                </div>

                                <div className="p-4 border rounded-lg bg-purple-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Smartphone className="w-4 h-4 text-purple-600" />
                                        <h3 className="font-semibold text-purple-900">SMS</h3>
                                    </div>
                                    <p className="text-sm text-purple-700 mb-4">
                                        Test Twilio SMS integration.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full bg-white hover:bg-purple-100"
                                        onClick={() => handleTestNotification('SMS')}
                                        disabled={isTesting}
                                    >
                                        Send Test SMS
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
