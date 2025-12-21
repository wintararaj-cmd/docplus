# Patient Management System

A comprehensive healthcare platform connecting patients and doctors with appointment booking, medical records management, and emergency communication features.

## Features

### For Patients
- 🔐 Secure registration and authentication
- 👨‍⚕️ Search and filter doctors by specialty, location, and availability
- 📅 Easy appointment booking with real-time availability
- 📋 Access to complete medical history and records
- 💊 Digital prescriptions and lab reports
- 💬 Emergency chat with doctors
- 🔔 Automated appointment reminders
- 📱 Mobile-responsive design

### For Doctors
- 🏥 Professional profile management
- 📆 Flexible availability scheduling
- 👥 Patient management dashboard
- 📝 Digital prescription creation
- 📊 Complete patient medical history access
- 💬 Emergency communication system
- 📈 Analytics and insights
- ⭐ Patient reviews and ratings

### For Administrators
- 📊 Comprehensive dashboard
- 👤 User management (patients and doctors)
- 📈 System analytics and reporting
- ⚙️ System configuration
- 🔍 Audit logs and compliance

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form + Zod validation
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- (Optional) SendGrid/AWS SES account for email
- (Optional) Twilio account for SMS

## Installation

1. **Clone the repository**
   ```bash
   cd e:\Project\webDevelop\pationMGMT
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

   Update the following required variables in `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/patient_mgmt"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

   Generate a secure NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**

   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE patient_mgmt;
   ```

   Run Prisma migrations:
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Database Commands

- **Push schema changes**: `npm run db:push`
- **Create migration**: `npm run db:migrate`
- **Open Prisma Studio**: `npm run db:studio`
- **Generate Prisma Client**: `npm run db:generate`

## Project Structure

```
pationMGMT/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── (auth)/           # Authentication routes
│   │   ├── (patient)/        # Patient portal
│   │   ├── (doctor)/         # Doctor portal
│   │   ├── (admin)/          # Admin panel
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── ui/              # UI components
│   │   ├── patient/         # Patient components
│   │   ├── doctor/          # Doctor components
│   │   └── shared/          # Shared components
│   ├── lib/                  # Utilities and configs
│   │   ├── db.ts            # Prisma client
│   │   ├── utils.ts         # Utility functions
│   │   ├── constants.ts     # Constants
│   │   └── validations/     # Zod schemas
│   ├── types/               # TypeScript types
│   └── services/            # Service layer
├── .env.example             # Environment variables template
├── .env.local              # Local environment variables (create this)
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies
```

## Development Workflow

1. **Phase 1**: ✅ Project setup and foundation - **COMPLETE**
2. **Phase 2**: ✅ Patient portal development - **COMPLETE**
3. **Phase 3**: 🔜 Doctor portal development - **NEXT**
4. **Phase 4**: 📅 Real-time communication
5. **Phase 5**: 📅 Admin panel
6. **Phase 6**: 📅 Notifications and reminders
7. **Phase 7**: 📅 Advanced features
8. **Phase 8**: 📅 Testing and deployment

### Current Status: Phase 2 Complete! 🎉

**What's Working:**
- ✅ Patient registration and authentication
- ✅ Patient dashboard with statistics
- ✅ Doctor search and filtering
- ✅ Doctor profile pages
- ✅ Appointment booking system
- ✅ Appointment management
- ✅ Medical records upload and management
- ✅ Responsive design
- ✅ Modern gradient UI

**Quick Start:**
```bash
npm run dev
```
Then visit `http://localhost:3000` and register as a patient!

**Documentation:**
- 📖 [Quick Start Guide](./QUICK_START.md)
- 📊 [Phase 2 Summary](./PHASE2_COMPLETE.md)
- 🎯 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- 🗺️ [Visual Overview](./VISUAL_OVERVIEW.md)
- 🗄️ [Database Setup](./DATABASE_SETUP.md)

## Security Features

- 🔒 Password hashing with bcrypt
- 🔐 JWT-based authentication
- 🛡️ HIPAA-compliant data handling
- 📝 Input validation with Zod
- 🔍 SQL injection prevention (Prisma)
- 🚫 XSS protection
- 📊 Audit logging
- 🔑 Role-based access control

## API Documentation

API routes are organized under `/api`:

- `/api/auth/*` - Authentication endpoints
- `/api/patients/*` - Patient management
- `/api/doctors/*` - Doctor management
- `/api/appointments/*` - Appointment booking
- `/api/medical-records/*` - Medical records
- `/api/prescriptions/*` - Prescriptions
- `/api/chat/*` - Messaging
- `/api/notifications/*` - Notifications

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact support@healthcare.com

## Roadmap

- [ ] Patient registration and authentication
- [ ] Doctor registration and verification
- [ ] Appointment booking system
- [ ] Medical records management
- [ ] Real-time chat
- [ ] Video consultations
- [ ] Payment integration
- [ ] Mobile apps (iOS/Android)
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Telemedicine features

---

Built with ❤️ using Next.js and modern web technologies
