# Quick Start Guide - Patient Management System

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git (optional)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/patient_mgmt"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Patient Management System"
```

**Generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3: Set Up Database
```bash
# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### Step 4: Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 📱 Testing the Application

### 1. Register as a Patient
1. Go to `/register`
2. Fill in your details
3. Select role: **PATIENT**
4. Submit the form

### 2. Complete Your Profile
After registration, you'll need to complete your patient profile with:
- Personal information (name, DOB, gender)
- Contact details
- Medical information (blood group, allergies, etc.)
- Emergency contact

### 3. Explore Patient Features

#### 🏥 Dashboard (`/patient/dashboard`)
- View upcoming appointments
- See recent medical records
- Check prescriptions
- Quick actions

#### 👨‍⚕️ Find Doctors (`/patient/doctors`)
- Search by name or specialization
- Filter by specialization
- Sort by rating, experience, or fee
- View doctor profiles

#### 📅 Book Appointment (`/patient/appointments/book`)
1. Select a doctor
2. Choose available date
3. Pick time slot
4. Enter reason for visit
5. Confirm booking

#### 📋 Manage Appointments (`/patient/appointments`)
- View upcoming appointments
- Check past appointments
- Cancel appointments
- See appointment details

#### 📄 Medical Records (`/patient/medical-records`)
- Upload medical documents
- Filter by record type
- Search records
- View and download files
- Delete records

---

## 🧪 Test Data Setup

### Create Test Doctors (Using Prisma Studio)

1. Start Prisma Studio:
```bash
npm run db:studio
```

2. Create a User with role `DOCTOR`:
```json
{
  "email": "dr.smith@hospital.com",
  "password": "$2b$10$...", // Use bcrypt to hash "password123"
  "role": "DOCTOR",
  "emailVerified": true
}
```

3. Create a Doctor profile linked to the user:
```json
{
  "userId": "user-id-from-step-2",
  "firstName": "John",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD",
  "experience": 10,
  "licenseNumber": "MED12345",
  "licenseVerified": true,
  "consultationFee": 500,
  "city": "New York",
  "isAvailable": true
}
```

4. Add Doctor Availability:
```json
{
  "doctorId": "doctor-id-from-step-3",
  "dayOfWeek": 1, // Monday
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "isActive": true
}
```

Repeat for other weekdays (0-6, Sunday-Saturday).

---

## 🎯 Current Features (Phase 2 Complete)

### ✅ Patient Portal
- [x] Patient registration and authentication
- [x] Patient dashboard with statistics
- [x] Doctor search and filtering
- [x] Doctor profile pages
- [x] Appointment booking system
- [x] Appointment management
- [x] Medical records upload/management
- [x] Responsive design
- [x] Modern UI with gradients

### 🚧 Coming Soon (Phase 3-8)
- [ ] Doctor portal
- [ ] Real-time chat
- [ ] Admin panel
- [ ] Email/SMS notifications
- [ ] Payment integration
- [ ] Analytics dashboard

---

## 📁 Project Structure

```
pationMGMT/
├── src/
│   ├── app/
│   │   ├── (patient)/          # Patient portal pages
│   │   │   ├── patient/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── doctors/
│   │   │   │   ├── appointments/
│   │   │   │   └── medical-records/
│   │   │   └── layout.tsx
│   │   ├── api/                # API routes
│   │   │   ├── doctors/
│   │   │   ├── appointments/
│   │   │   └── medical-records/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── patient/            # Patient-specific components
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   └── utils.ts
│   └── types/
├── prisma/
│   └── schema.prisma          # Database schema
└── public/
    └── uploads/               # Uploaded files
```

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
npm run db:migrate       # Create migration
npm run db:generate      # Generate Prisma Client

# Code Quality
npm run lint             # Run ESLint
```

---

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Verify database exists: `patient_mgmt`

### Authentication Issues
- Clear browser cookies
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your dev server

### File Upload Issues
- Ensure `public/uploads/medical-records/` directory exists
- Check file size limits (default: 10MB)
- Verify file types are allowed

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

---

## 📚 Documentation

- [Database Setup Guide](./DATABASE_SETUP.md)
- [Authentication Complete](./AUTH_COMPLETE.md)
- [Phase 2 Summary](./PHASE2_COMPLETE.md)
- [Implementation Plan](./.agent/workflows/implementation-plan.md)

---

## 🎨 Design System

### Colors
- Primary: Blue (#2563eb) to Purple (#9333ea) gradient
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)
- Gray scale: Tailwind default

### Components
- Cards: Rounded with shadow
- Buttons: Gradient primary, outlined secondary
- Forms: Clean with focus states
- Navigation: Sticky with gradient branding

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ File upload validation
- ✅ Secure session management

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the documentation files
3. Check the implementation plan
4. Inspect browser console for errors

---

**Happy Coding! 🚀**

Built with Next.js, TypeScript, Prisma, and ❤️
