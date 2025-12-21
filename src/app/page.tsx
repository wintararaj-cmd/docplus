'use client'

import Link from 'next/link'
import { ArrowRight, Calendar, FileText, MessageSquare, Shield, Users, Video, Heart, Clock, Star } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Heart className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                HealthCare+
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
                            Your Health,{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Our Priority
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Connect with top doctors, manage your medical records, and get instant care when you need it most.
                            Experience healthcare reimagined.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register?role=patient"
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
                            >
                                Book Appointment
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="/register?role=doctor"
                                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all duration-300"
                            >
                                Join as Doctor
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                            <div className="text-gray-600">Happy Patients</div>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                            <div className="text-gray-600">Expert Doctors</div>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="text-4xl font-bold text-pink-600 mb-2">50+</div>
                            <div className="text-gray-600">Specializations</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need for Better Healthcare
                        </h2>
                        <p className="text-xl text-gray-600">
                            Comprehensive features designed for modern healthcare management
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Appointment Booking</h3>
                            <p className="text-gray-600">
                                Book appointments with top doctors in just a few clicks. View real-time availability and get instant confirmation.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Medical Records</h3>
                            <p className="text-gray-600">
                                Access your complete medical history, prescriptions, and lab reports anytime, anywhere. All in one secure place.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Emergency Chat</h3>
                            <p className="text-gray-600">
                                Get instant medical advice through our emergency chat feature. Connect with doctors in real-time for urgent concerns.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                                <Video className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Consultations</h3>
                            <p className="text-gray-600">
                                Consult with doctors from the comfort of your home. High-quality video calls for remote healthcare.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Reminders</h3>
                            <p className="text-gray-600">
                                Never miss an appointment or medication. Get automated reminders via email and SMS.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
                            <p className="text-gray-600">
                                Your data is protected with enterprise-grade security. We follow strict HIPAA compliance standards.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Get started in three simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h3>
                            <p className="text-gray-600">
                                Sign up in minutes with your email or phone number. Complete your profile to get started.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Doctor</h3>
                            <p className="text-gray-600">
                                Search for doctors by specialty, location, or availability. Read reviews and choose the best fit.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                3
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Book & Consult</h3>
                            <p className="text-gray-600">
                                Book your appointment and get instant confirmation. Consult in-person or via video call.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Ready to Transform Your Healthcare Experience?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of patients and doctors already using our platform
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Heart className="h-6 w-6 text-blue-400" />
                                <span className="text-lg font-bold">HealthCare+</span>
                            </div>
                            <p className="text-gray-400">
                                Modern healthcare platform connecting patients and doctors.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">For Patients</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/register?role=patient" className="hover:text-white">Sign Up</Link></li>
                                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                                <li><Link href="#" className="hover:text-white">Find Doctors</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">For Doctors</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/register?role=doctor" className="hover:text-white">Join Us</Link></li>
                                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                                <li><Link href="#" className="hover:text-white">Resources</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-white">About Us</Link></li>
                                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 HealthCare+. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
