# Database Setup Guide

## Prerequisites

You need PostgreSQL installed on your system. If you don't have it:

### Windows
Download and install from: https://www.postgresql.org/download/windows/

### Using Docker (Recommended for Development)
```bash
docker run --name patient-mgmt-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=patient_mgmt -p 5432:5432 -d postgres:14
```

## Setup Steps

### 1. Create the Database

**Option A: Using psql command line**
```bash
psql -U postgres
CREATE DATABASE patient_mgmt;
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Name it `patient_mgmt`
5. Click "Save"

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/patient_mgmt"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-key-here"

# Optional: Email Configuration (for later)
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="noreply@healthcare.com"

# Optional: SMS Configuration (for later)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# File Storage
STORAGE_TYPE="local"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Patient Management System"
```

**Important:** Replace `your_password` with your PostgreSQL password.

### 3. Generate a Secure NEXTAUTH_SECRET

**Using OpenSSL (Git Bash on Windows):**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as your `NEXTAUTH_SECRET` in `.env.local`.

### 4. Push the Database Schema

```bash
npm run db:push
```

This will:
- Connect to your PostgreSQL database
- Create all the tables defined in `prisma/schema.prisma`
- Generate the Prisma Client

You should see output like:
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

### 5. (Optional) Open Prisma Studio

To view and manage your database with a GUI:

```bash
npm run db:studio
```

This opens a browser at `http://localhost:5555` where you can:
- View all tables
- Add/edit/delete records
- Browse relationships
- Test queries

## Database Schema Overview

Your database now has these tables:

### Core Tables
- **User** - Authentication and base user info
- **Patient** - Patient profiles and medical information
- **Doctor** - Doctor profiles and credentials

### Appointment System
- **Appointment** - Scheduled appointments
- **DoctorAvailability** - Doctor working hours and slots

### Medical Records
- **MedicalRecord** - Patient medical documents
- **Prescription** - Doctor prescriptions
- **LabReport** - Laboratory test results

### Communication
- **Message** - Chat messages (including emergency)
- **Notification** - System notifications

### System
- **Review** - Doctor reviews and ratings
- **AuditLog** - Security and compliance logging

## Common Database Commands

### View Database Status
```bash
npm run db:studio
```

### Create a Migration (for production)
```bash
npm run db:migrate
```

### Reset Database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

### Seed Database (when seed script is created)
```bash
npx prisma db seed
```

## Troubleshooting

### Error: "Can't reach database server"
- Check if PostgreSQL is running
- Verify the connection string in `.env.local`
- Check if the port (5432) is correct
- Ensure the database exists

### Error: "Authentication failed"
- Check your PostgreSQL username and password
- Verify the credentials in `DATABASE_URL`

### Error: "Database does not exist"
- Create the database first (see Step 1)
- Ensure the database name matches in `DATABASE_URL`

### Error: "Port 5432 is already in use"
- Another PostgreSQL instance might be running
- Change the port in both PostgreSQL and `DATABASE_URL`

## Next Steps

Once your database is set up:

1. ✅ Database is running
2. ✅ Tables are created
3. ✅ Prisma Client is generated
4. 🚀 Ready to build features!

You can now:
- Start building the authentication system
- Create API routes that interact with the database
- Test with Prisma Studio

## Example: Testing the Database

You can test if everything works by creating a simple API route:

Create `src/app/api/test-db/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Count users
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connected!',
      userCount
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Database connection failed'
    }, { status: 500 })
  }
}
```

Then visit: `http://localhost:3000/api/test-db`

You should see:
```json
{
  "success": true,
  "message": "Database connected!",
  "userCount": 0
}
```

## Database Connection String Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Examples:
- Local: `postgresql://postgres:password@localhost:5432/patient_mgmt`
- Docker: `postgresql://postgres:password@localhost:5432/patient_mgmt`
- Remote: `postgresql://user:pass@db.example.com:5432/patient_mgmt`

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to version control
- Use strong passwords for production
- Rotate secrets regularly
- Use SSL for production databases
- Limit database user permissions

## Production Considerations

For production deployment:
1. Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
2. Enable SSL connections
3. Set up automated backups
4. Use connection pooling
5. Monitor database performance
6. Implement proper migrations workflow

---

Need help? Check the Prisma documentation: https://www.prisma.io/docs
