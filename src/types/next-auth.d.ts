import { DefaultSession, DefaultUser } from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: UserRole
            patientId?: string
            doctorId?: string
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        role: UserRole
        patientId?: string
        doctorId?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: UserRole
        patientId?: string
        doctorId?: string
    }
}
