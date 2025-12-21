# Quick Setup Guide - Update .env.local

## Step 1: Open .env.local file
The file has been created at: `e:\Project\webDevelop\pationMGMT\.env.local`

## Step 2: Update DATABASE_URL

Find this line:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/patient_mgmt"
```

Replace with your actual PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/patient_mgmt"
```

**Example:**
If your PostgreSQL password is `admin123`, it should be:
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/patient_mgmt"
```

## Step 3: Generate and Update NEXTAUTH_SECRET

### Option A: Using Git Bash (recommended)
```bash
openssl rand -base64 32
```

### Option B: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option C: Using PowerShell
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the output and paste it in .env.local:
```env
NEXTAUTH_SECRET="paste-your-generated-secret-here"
```

## Step 4: Verify Your .env.local

Your `.env.local` file should look like this (with your actual values):

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/patient_mgmt"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET_KEY_HERE"

# Email (Optional - can leave as is for now)
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="noreply@healthcare.com"

# SMS (Optional - can leave as is for now)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# File Storage
STORAGE_TYPE="local"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""

# Socket.io
SOCKET_PORT=3001

# Encryption
ENCRYPTION_KEY="your-encryption-key-change-this-in-production"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Patient Management System"
```

## Step 5: Test the Connection

After updating `.env.local`, run:
```bash
npm run db:push
```

You should see:
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

## Common Issues

### Issue: "Environment variable not found: DATABASE_URL"
**Solution:** Make sure you saved the `.env.local` file after editing it.

### Issue: "Can't reach database server"
**Solution:** 
- Check if PostgreSQL is running
- Verify your username and password are correct
- Ensure the database `patient_mgmt` exists

### Issue: "Authentication failed"
**Solution:** Double-check your PostgreSQL password in the DATABASE_URL

## Need Help?

If you're stuck, please share:
1. What PostgreSQL username you're using (usually `postgres`)
2. Whether PostgreSQL is running on the default port 5432
3. Any error messages you see

---

**Next:** Once `npm run db:push` succeeds, we can start the dev server and begin building features!
