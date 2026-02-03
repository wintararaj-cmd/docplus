import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clean up existing data
    console.log('Cleaning up database...');
    try {
        await prisma.appointment.deleteMany();
        await prisma.doctorAvailability.deleteMany();
        await prisma.review.deleteMany();
        await prisma.message.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.auditLog.deleteMany();
        await prisma.prescription.deleteMany();
        await prisma.labReport.deleteMany();
        await prisma.medicalRecord.deleteMany();
        await prisma.doctor.deleteMany();
        await prisma.patient.deleteMany();
        await prisma.user.deleteMany();
    } catch (error) {
        console.log('Database was empty or cleanup failed (non-fatal)');
    }

    // Create test patient
    console.log('Creating test patient...');
    const patientPassword = await bcrypt.hash('password123', 10);

    const patient = await prisma.user.upsert({
        where: { email: 'patient@test.com' },
        update: {},
        create: {
            email: 'patient@test.com',
            phone: '+1234567890',
            password: patientPassword,
            role: 'PATIENT',
            emailVerified: true,
            isActive: true,
            patient: {
                create: {
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: new Date('1990-01-15'),
                    gender: 'Male',
                    bloodGroup: 'O+',
                    address: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    emergencyContact: 'Jane Doe',
                    emergencyPhone: '+1234567891',
                },
            },
        },
    });
    console.log('✅ Test patient created:', patient.email);

    // Create test doctor (verified)
    console.log('Creating verified test doctor...');
    const doctorPassword = await bcrypt.hash('password123', 10);

    const doctor = await prisma.user.upsert({
        where: { email: 'doctor@test.com' },
        update: {},
        create: {
            email: 'doctor@test.com',
            phone: '+1234567892',
            password: doctorPassword,
            role: 'DOCTOR',
            emailVerified: true,
            isActive: true,
            doctor: {
                create: {
                    firstName: 'Sarah',
                    lastName: 'Smith',
                    specialization: 'Cardiology',
                    qualification: 'MBBS, MD (Cardiology)',
                    experience: 10,
                    licenseNumber: 'DOC001',
                    licenseVerified: true,
                    consultationFee: 500,
                    about: 'Experienced cardiologist with 10 years of practice. Specialized in heart disease prevention and treatment.',
                    address: '456 Medical Plaza',
                    city: 'Boston',
                    state: 'MA',
                    zipCode: '02101',
                    isAvailable: true,
                    rating: 4.8,
                    totalReviews: 45,
                    availability: {
                        create: [1, 2, 3, 4, 5].map(day => ({
                            dayOfWeek: day,
                            startTime: '09:00',
                            endTime: '17:00',
                            slotDuration: 30
                        }))
                    }
                },
            },
        },
    });
    console.log('✅ Verified test doctor created:', doctor.email);

    // Create pending doctor (needs verification)
    console.log('Creating pending test doctor...');
    const pendingDoctorPassword = await bcrypt.hash('password123', 10);

    const pendingDoctor = await prisma.user.upsert({
        where: { email: 'doctor.pending@test.com' },
        update: {},
        create: {
            email: 'doctor.pending@test.com',
            phone: '+1234567893',
            password: pendingDoctorPassword,
            role: 'DOCTOR',
            emailVerified: false,
            isActive: false,
            doctor: {
                create: {
                    firstName: 'Michael',
                    lastName: 'Johnson',
                    specialization: 'Neurology',
                    qualification: 'MBBS, MD (Neurology)',
                    experience: 5,
                    licenseNumber: 'DOC002',
                    licenseVerified: false,
                    consultationFee: 600,
                    about: 'Neurologist specializing in brain and nervous system disorders.',
                    address: '789 Health Center',
                    city: 'Chicago',
                    state: 'IL',
                    zipCode: '60601',
                    isAvailable: false,
                },
            },
        },
    });
    console.log('✅ Pending test doctor created:', pendingDoctor.email);

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            email: 'admin@test.com',
            password: adminPassword,
            role: 'ADMIN',
            emailVerified: true,
            isActive: true,
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create more test doctors with different specializations
    const specializations = [
        { name: 'Dermatology', firstName: 'Emily', lastName: 'Brown', license: 'DOC003', fee: 400 },
        { name: 'Pediatrics', firstName: 'David', lastName: 'Wilson', license: 'DOC004', fee: 450 },
        { name: 'Orthopedics', firstName: 'Lisa', lastName: 'Martinez', license: 'DOC005', fee: 550 },
    ];

    for (const spec of specializations) {
        const docPassword = await bcrypt.hash('password123', 10);
        const email = `${spec.firstName.toLowerCase()}.${spec.lastName.toLowerCase()}@test.com`;

        await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: docPassword,
                role: 'DOCTOR',
                emailVerified: true,
                isActive: true,
                doctor: {
                    create: {
                        firstName: spec.name,
                        lastName: spec.lastName,
                        specialization: spec.name,
                        qualification: 'MBBS, MD',
                        experience: Math.floor(Math.random() * 15) + 3,
                        licenseNumber: spec.license,
                        licenseVerified: true,
                        consultationFee: spec.fee,
                        about: `Experienced ${spec.name} specialist.`,
                        city: 'San Francisco',
                        state: 'CA',
                        isAvailable: true,
                        rating: 4.0 + Math.random() * 0.9,
                        totalReviews: Math.floor(Math.random() * 50) + 10,
                        availability: {
                            create: [1, 2, 3, 4, 5].map(day => ({
                                dayOfWeek: day,
                                startTime: '09:00',
                                endTime: '17:00',
                                slotDuration: 30
                            }))
                        }
                    },
                },
            },
        });
        console.log(`✅ Test doctor created: ${email}`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Patient:');
    console.log('   Email: patient@test.com');
    console.log('   Password: password123');
    console.log('\n👨‍⚕️ Verified Doctor:');
    console.log('   Email: doctor@test.com');
    console.log('   Password: password123');
    console.log('\n⏳ Pending Doctor (needs verification):');
    console.log('   Email: doctor.pending@test.com');
    console.log('   Password: password123');
    console.log('\n👑 Admin:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
