'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface UploadLabReportDialogProps {
    patientId: string;
    patientName: string;
    onSuccess?: () => void;
}

export function UploadLabReportDialog({ patientId, patientName, onSuccess }: UploadLabReportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [testName, setTestName] = useState('');
    const [testDate, setTestDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !testName || !testDate) {
            toast.error('Please fill all fields and select a file');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('patientId', patientId);
            formData.append('testName', testName);
            formData.append('testDate', testDate);
            formData.append('file', file);
            // Optional: Add results JSON if needed
            formData.append('results', '{}');

            const response = await fetch('/api/doctor/lab-reports', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();

            toast.success('Lab report uploaded & patient notified');
            setIsOpen(false);
            setTestName('');
            setFile(null);
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error uploading report:', error);
            toast.error('Failed to upload report');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Lab Report
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Lab Report</DialogTitle>
                    <DialogDescription>
                        Upload test results for <strong>{patientName}</strong>.
                        The patient will be notified immediately.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="testName">Test Name</Label>
                        <Input
                            id="testName"
                            placeholder="e.g. Complete Blood Count (CBC)"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="testDate">Test Date</Label>
                        <Input
                            id="testDate"
                            type="date"
                            value={testDate}
                            onChange={(e) => setTestDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Report File (PDF/Image)</Label>
                        <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-sm text-muted-foreground hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <Input
                                id="file"
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                accept=".pdf,image/*"
                            />
                            {file ? (
                                <div className="flex items-center text-blue-600 font-medium">
                                    <FileText className="w-4 h-4 mr-2" />
                                    {file.name}
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                    <span>Click to select file</span>
                                    <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</span>
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                'Upload & Notify'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
