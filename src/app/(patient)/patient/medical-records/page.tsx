'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, Download, Eye, Trash2, Plus, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface MedicalRecord {
    id: string
    title: string
    description?: string
    recordType: string
    recordDate: string
    fileName?: string
    fileUrl?: string
    fileSize?: number
    createdAt: string
}

const recordTypes = [
    'All Types',
    'Consultation',
    'Lab Report',
    'Prescription',
    'Imaging',
    'Surgery',
    'Vaccination',
    'Other'
]

export default function MedicalRecordsPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [selectedType, setSelectedType] = useState('All Types')
    const [searchQuery, setSearchQuery] = useState('')
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

    // Upload form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [recordType, setRecordType] = useState('Consultation')
    const [recordDate, setRecordDate] = useState('')
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        fetchRecords()
    }, [])

    useEffect(() => {
        filterRecords()
    }, [records, selectedType, searchQuery])

    const fetchRecords = async () => {
        try {
            const response = await fetch('/api/medical-records')
            const data = await response.json()
            if (data.success) {
                setRecords(data.records || [])
            }
        } catch (error) {
            toast.error('Failed to load medical records')
        } finally {
            setLoading(false)
        }
    }

    const filterRecords = () => {
        let filtered = [...records]

        if (selectedType !== 'All Types') {
            filtered = filtered.filter(record => record.recordType === selectedType)
        }

        if (searchQuery) {
            filtered = filtered.filter(record =>
                record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredRecords(filtered)
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title || !recordType || !recordDate) {
            toast.error('Please fill all required fields')
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('description', description)
            formData.append('recordType', recordType)
            formData.append('recordDate', recordDate)
            if (file) {
                formData.append('file', file)
            }

            const response = await fetch('/api/medical-records', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Medical record uploaded successfully!')
                setIsUploadDialogOpen(false)
                resetForm()
                fetchRecords()
            } else {
                toast.error(data.error || 'Failed to upload record')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (recordId: string) => {
        if (!confirm('Are you sure you want to delete this record?')) {
            return
        }

        try {
            const response = await fetch(`/api/medical-records/${recordId}`, {
                method: 'DELETE'
            })

            const data = await response.json()
            if (data.success) {
                toast.success('Record deleted successfully')
                fetchRecords()
            } else {
                toast.error(data.error || 'Failed to delete record')
            }
        } catch (error) {
            toast.error('An error occurred')
        }
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setRecordType('Consultation')
        setRecordDate('')
        setFile(null)
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'N/A'
        const kb = bytes / 1024
        const mb = kb / 1024
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`
    }

    const getRecordTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Consultation': 'bg-blue-100 text-blue-700',
            'Lab Report': 'bg-green-100 text-green-700',
            'Prescription': 'bg-purple-100 text-purple-700',
            'Imaging': 'bg-orange-100 text-orange-700',
            'Surgery': 'bg-red-100 text-red-700',
            'Vaccination': 'bg-teal-100 text-teal-700',
            'Other': 'bg-gray-100 text-gray-700'
        }
        return colors[type] || colors['Other']
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Records</h1>
                    <p className="text-gray-600">Manage your health documents and reports</p>
                </div>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Record
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Upload Medical Record</DialogTitle>
                            <DialogDescription>
                                Add a new medical document to your health records
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Blood Test Results"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Additional details about this record"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recordType">Record Type *</Label>
                                    <Select value={recordType} onValueChange={setRecordType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {recordTypes.filter(t => t !== 'All Types').map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recordDate">Record Date *</Label>
                                    <Input
                                        id="recordDate"
                                        type="date"
                                        value={recordDate}
                                        onChange={(e) => setRecordDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">Upload File (Optional)</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-gray-500">
                                    Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsUploadDialogOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Record'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                {recordTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-gray-600">
                    Found <span className="font-semibold text-gray-900">{filteredRecords.length}</span> records
                </p>
            </div>

            {/* Records Grid */}
            {filteredRecords.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="py-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No medical records found</h3>
                        <p className="text-gray-600 mb-6">
                            {records.length === 0
                                ? 'Upload your first medical record to get started'
                                : 'Try adjusting your search or filters'}
                        </p>
                        {records.length === 0 && (
                            <Button
                                onClick={() => setIsUploadDialogOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Upload Record
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecords.map((record) => (
                        <Card key={record.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg mb-2">{record.title}</CardTitle>
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getRecordTypeColor(record.recordType)}`}>
                                            {record.recordType}
                                        </span>
                                    </div>
                                    <FileText className="w-8 h-8 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {record.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>
                                )}

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Record Date:</span>
                                        <span className="font-medium text-gray-900">
                                            {format(new Date(record.recordDate), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    {record.fileName && (
                                        <div className="flex items-center justify-between text-gray-600">
                                            <span>File Size:</span>
                                            <span className="font-medium text-gray-900">
                                                {formatFileSize(record.fileSize)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Uploaded:</span>
                                        <span className="font-medium text-gray-900">
                                            {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-3 border-t">
                                    {record.fileUrl && (
                                        <Button variant="outline" size="sm" className="flex-1" asChild>
                                            <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </a>
                                        </Button>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleDelete(record.id)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
