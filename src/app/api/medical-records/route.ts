import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'PATIENT') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        })

        if (!patient) {
            return NextResponse.json({ success: true, records: [] })
        }

        const records = await prisma.medicalRecord.findMany({
            where: { patientId: patient.id },
            orderBy: { recordDate: 'desc' }
        })

        return NextResponse.json({
            success: true,
            records
        })
    } catch (error) {
        console.error('Error fetching medical records:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch medical records' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'PATIENT') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        })

        if (!patient) {
            return NextResponse.json(
                { success: false, error: 'Patient profile not found' },
                { status: 404 }
            )
        }

        const formData = await request.formData()
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const recordType = formData.get('recordType') as string
        const recordDate = formData.get('recordDate') as string
        const file = formData.get('file') as File | null

        let fileUrl: string | undefined
        let fileName: string | undefined
        let fileSize: number | undefined

        if (file) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Create unique filename
            const timestamp = Date.now()
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            fileName = `${timestamp}-${originalName}`

            // Save to public/uploads directory
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'medical-records')
            const filePath = join(uploadDir, fileName)

            // Create directory if it doesn't exist
            const fs = require('fs')
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }

            await writeFile(filePath, buffer)
            fileUrl = `/uploads/medical-records/${fileName}`
            fileSize = buffer.length
        }

        const record = await prisma.medicalRecord.create({
            data: {
                patientId: patient.id,
                title,
                description: description || undefined,
                recordType,
                recordDate: new Date(recordDate),
                fileUrl,
                fileName,
                fileSize,
                uploadedBy: session.user.id
            }
        })

        return NextResponse.json({
            success: true,
            record
        })
    } catch (error) {
        console.error('Error creating medical record:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create medical record' },
            { status: 500 }
        )
    }
}
