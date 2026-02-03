import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { Star, MapPin, Clock, DollarSign, Award, Calendar, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'


async function getDoctorDetails(doctorId: string) {
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
            user: {
                select: {
                    email: true,
                    phone: true
                }
            },
            availability: {
                where: { isActive: true },
                orderBy: { dayOfWeek: 'asc' }
            },
            reviews: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    })

    return doctor
}

export default async function DoctorProfilePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    const doctor = await getDoctorDetails(params.id)

    if (!doctor) {
        notFound()
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link href="/patient/doctors">
                <Button variant="ghost" size="sm">
                    ← Back to Doctors
                </Button>
            </Link>

            {/* Doctor Profile Header */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <CardContent className="relative pt-0 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-3xl font-bold">
                                {getInitials(doctor.firstName, doctor.lastName)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 mt-4 md:mt-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Dr. {doctor.firstName} {doctor.lastName}
                                    </h1>
                                    <p className="text-lg text-gray-600 mt-1">{doctor.specialization}</p>
                                    <div className="flex items-center space-x-4 mt-3">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold text-gray-900">{doctor.rating.toFixed(1)}</span>
                                            <span className="text-gray-500">({doctor.totalReviews} reviews)</span>
                                        </div>
                                        <Separator orientation="vertical" className="h-6" />
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-5 h-5 mr-1" />
                                            <span>{doctor.experience} years exp.</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0">
                                    <div className="text-right mb-2">
                                        <p className="text-sm text-gray-600">Consultation Fee</p>
                                        <p className="text-3xl font-bold text-blue-600">₹{doctor.consultationFee}</p>
                                    </div>
                                    {session?.user?.role === 'PATIENT' && (
                                        <Link href={`/patient/appointments/book?doctorId=${doctor.id}`}>
                                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Book Appointment
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                {/* About Tab */}
                <TabsContent value="about" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>About Dr. {doctor.lastName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {doctor.about && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Biography</h3>
                                    <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Award className="w-5 h-5 text-blue-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Qualification</p>
                                            <p className="text-gray-600">{doctor.qualification}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">License Number</p>
                                            <p className="text-gray-600">{doctor.licenseNumber}</p>
                                            {doctor.licenseVerified && (
                                                <span className="text-xs text-green-600 font-medium">✓ Verified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Location</p>
                                            <p className="text-gray-600">
                                                {doctor.address && `${doctor.address}, `}
                                                {doctor.city && `${doctor.city}, `}
                                                {doctor.state && doctor.state}
                                                {doctor.zipCode && ` - ${doctor.zipCode}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <Clock className="w-5 h-5 text-blue-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Experience</p>
                                            <p className="text-gray-600">{doctor.experience} years in practice</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Availability Tab */}
                <TabsContent value="availability" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>Doctor's available time slots</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {doctor.availability.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No availability schedule set</p>
                            ) : (
                                <div className="space-y-3">
                                    {doctor.availability.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-24 font-semibold text-gray-900">
                                                    {daysOfWeek[slot.dayOfWeek]}
                                                </div>
                                                <div className="text-gray-600">
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {slot.slotDuration} min slots
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Patient Reviews</CardTitle>
                            <CardDescription>
                                {doctor.totalReviews} reviews • Average rating: {doctor.rating.toFixed(1)}/5
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {doctor.reviews.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No reviews yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {doctor.reviews.map((review) => (
                                        <div key={review.id} className="p-4 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{review.patientName}</p>
                                                    <div className="flex items-center mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-600 mt-2">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
