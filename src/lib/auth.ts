import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import prisma from '@/lib/db'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials')
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                    include: {
                        patient: true,
                        doctor: true,
                    },
                })

                if (!user) {
                    throw new Error('Invalid credentials')
                }

                if (!user.isActive) {
                    throw new Error('Account is deactivated. Please contact support.')
                }

                const isPasswordValid = await compare(credentials.password, user.password)

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials')
                }

                // Get name from profile
                let name = user.email;
                if (user.patient) {
                    name = `${user.patient.firstName} ${user.patient.lastName}`;
                } else if (user.doctor) {
                    name = `Dr. ${user.doctor.firstName} ${user.doctor.lastName}`;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: name,
                    role: user.role,
                    patientId: user.patient?.id,
                    doctorId: user.doctor?.id,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.role = user.role
                token.patientId = user.patientId
                token.doctorId = user.doctorId
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.name = token.name as string
                session.user.role = token.role as UserRole
                session.user.patientId = token.patientId as string | undefined
                session.user.doctorId = token.doctorId as string | undefined
            }
            return session
        },
    },
}
