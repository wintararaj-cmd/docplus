import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PatientNav from '@/components/patient/PatientNav'

export default async function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    // Redirect if not authenticated
    if (!session) {
        redirect('/login')
    }

    // Redirect if not a patient
    if (session.user.role !== 'PATIENT') {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <PatientNav user={session.user} />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
