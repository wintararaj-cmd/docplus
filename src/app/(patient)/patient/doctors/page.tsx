'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Star, MapPin, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

interface Doctor {
    id: string
    firstName: string
    lastName: string
    specialization: string
    qualification: string
    experience: number
    consultationFee: number
    rating: number
    totalReviews: number
    city: string
    isAvailable: boolean
}

const specializations = [
    'All Specializations',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'General Medicine',
    'ENT',
    'Ophthalmology'
]

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations')
    const [sortBy, setSortBy] = useState('rating')

    useEffect(() => {
        fetchDoctors()
    }, [])

    useEffect(() => {
        filterAndSortDoctors()
    }, [doctors, searchQuery, selectedSpecialization, sortBy])

    const fetchDoctors = async () => {
        try {
            const response = await fetch('/api/doctors')
            const data = await response.json()
            setDoctors(data.doctors || [])
        } catch (error) {
            console.error('Error fetching doctors:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterAndSortDoctors = () => {
        let filtered = [...doctors]

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(doctor =>
                `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by specialization
        if (selectedSpecialization !== 'All Specializations') {
            filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization)
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating
                case 'experience':
                    return b.experience - a.experience
                case 'fee-low':
                    return a.consultationFee - b.consultationFee
                case 'fee-high':
                    return b.consultationFee - a.consultationFee
                default:
                    return 0
            }
        })

        setFilteredDoctors(filtered)
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase()
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
                <p className="text-gray-600">Search and book appointments with qualified healthcare professionals</p>
            </div>

            {/* Search and Filters */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search by name or specialization..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Specialization Filter */}
                        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                            <SelectTrigger>
                                <SelectValue placeholder="Specialization" />
                            </SelectTrigger>
                            <SelectContent>
                                {specializations.map((spec) => (
                                    <SelectItem key={spec} value={spec}>
                                        {spec}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort By */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                                <SelectItem value="experience">Most Experienced</SelectItem>
                                <SelectItem value="fee-low">Fee: Low to High</SelectItem>
                                <SelectItem value="fee-high">Fee: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-gray-600">
                    Found <span className="font-semibold text-gray-900">{filteredDoctors.length}</span> doctors
                </p>
            </div>

            {/* Doctors Grid */}
            {filteredDoctors.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="py-12 text-center">
                        <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                            <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                            <CardHeader className="pb-4">
                                <div className="flex items-start space-x-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg font-semibold">
                                            {getInitials(doctor.firstName, doctor.lastName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg mb-1">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            {doctor.specialization}
                                        </CardDescription>
                                        <div className="flex items-center mt-2">
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {doctor.rating.toFixed(1)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    ({doctor.totalReviews})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>{doctor.experience} years experience</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{doctor.city || 'Location not specified'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        <span className="font-semibold text-gray-900">₹{doctor.consultationFee}</span>
                                        <span className="ml-1">consultation fee</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${doctor.isAvailable
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {doctor.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                        <Link href={`/patient/doctors/${doctor.id}`}>
                                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                                View Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
