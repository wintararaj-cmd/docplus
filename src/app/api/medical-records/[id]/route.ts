import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const record = await prisma.medicalRecord.findUnique({
            where: { id: params.id }
        })

        if (!record) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            )
        }

        // Delete file if exists
        if (record.fileName) {
            try {
                const filePath = join(process.cwd(), 'public', 'uploads', 'medical-records', record.fileName)
                await unlink(filePath)
            } catch (error) {
                console.error('Error deleting file:', error)
            }
        }

        await prisma.medicalRecord.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            success: true
        })
    } catch (error) {
        console.error('Error deleting medical record:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete medical record' },
            { status: 500 }
        )
    }
}
