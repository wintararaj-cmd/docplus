# 📝 Patient and Doctor Registration System

## Overview
Complete registration system implemented for both patients and doctors with comprehensive profile creation, validation, and role-based access control.

---

## ✅ Features Implemented

### 1. **Role Selection Page**
- Beautiful landing page with role selection
- Separate cards for Patient and Doctor registration
- Feature highlights for each role
- Responsive design

### 2. **Patient Registration**
**Form Sections:**
- **Account Information**
  - Email (required, unique)
  - Phone number (optional, unique if provided)
  - Password (required, min 6 characters)
  - Confirm Password (required, must match)

- **Personal Information**
  - First Name (required)
  - Last Name (required)
  - Date of Birth (required)
  - Gender (required: Male/Female/Other)
  - Blood Group (optional: A+, A-, B+, B-, AB+, AB-, O+, O-)

- **Address**
  - Street Address (optional)
  - City (optional)
  - State (optional)
  - ZIP Code (optional)

- **Emergency Contact**
  - Contact Name (optional)
  - Contact Phone (optional)

**Features:**
- ✅ Real-time form validation
- ✅ Password strength requirements
- ✅ Password confirmation matching
- ✅ Loading states during submission
- ✅ Toast notifications for success/error
- ✅ Automatic redirect to login after success
- ✅ Immediate account activation

### 3. **Doctor Registration**
**Form Sections:**
- **Account Information**
  - Email (required, unique)
  - Phone number (optional, unique if provided)
  - Password (required, min 6 characters)
  - Confirm Password (required, must match)

- **Personal Information**
  - First Name (required)
  - Last Name (required)

- **Professional Information**
  - Specialization (required, dropdown with 13 options)
  - Qualification (required, e.g., MBBS, MD)
  - Years of Experience (required, number)
  - Medical License Number (required, unique)
  - Consultation Fee (required, in ₹)
  - About/Bio (optional, textarea)

- **Clinic Address**
  - Street Address (optional)
  - City (optional)
  - State (optional)
  - ZIP Code (optional)

**Features:**
- ✅ Real-time form validation
- ✅ License number uniqueness check
- ✅ Professional credentials validation
- ✅ Loading states during submission
- ✅ Toast notifications for success/error
- ✅ Automatic redirect to login after success
- ✅ **Account pending verification** (requires admin approval)
- ✅ Clear notification about verification requirement

---

## 🔐 Security Features

### Password Security
- Minimum 6 characters required
- Bcrypt hashing with 10 salt rounds
- Password confirmation validation

### Data Validation
- Email format validation
- Unique email constraint
- Unique phone number constraint (if provided)
- Unique medical license number (for doctors)
- Required field validation
- Type validation (numbers, dates, etc.)

### Account Activation
- **Patients**: Immediately activated (`isActive: true`)
- **Doctors**: Pending verification (`isActive: false`)
  - Requires admin approval
  - License verification needed
  - Not available for appointments until verified

---

## 📊 Database Schema

### User Table
```prisma
User {
  id: String (cuid)
  email: String (unique)
  phone: String? (unique)
  password: String (hashed)
  role: UserRole (PATIENT | DOCTOR | ADMIN)
  emailVerified: Boolean (default: false)
  isActive: Boolean (default: true for patients, false for doctors)
  patient: Patient? (relation)
  doctor: Doctor? (relation)
}
```

### Patient Table
```prisma
Patient {
  id: String (cuid)
  userId: String (unique, foreign key)
  firstName: String
  lastName: String
  dateOfBirth: DateTime
  gender: String
  bloodGroup: String?
  address: String?
  city: String?
  state: String?
  zipCode: String?
  emergencyContact: String?
  emergencyPhone: String?
}
```

### Doctor Table
```prisma
Doctor {
  id: String (cuid)
  userId: String (unique, foreign key)
  firstName: String
  lastName: String
  specialization: String
  qualification: String
  experience: Int
  licenseNumber: String (unique)
  licenseVerified: Boolean (default: false)
  consultationFee: Float
  about: String?
  address: String?
  city: String?
  state: String?
  zipCode: String?
  isAvailable: Boolean (default: false until verified)
}
```

---

## 🚀 API Endpoints

### POST `/api/auth/register`

**Request Body (Patient):**
```json
{
  "email": "patient@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "PATIENT",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "bloodGroup": "O+",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+1234567891"
}
```

**Request Body (Doctor):**
```json
{
  "email": "doctor@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "DOCTOR",
  "firstName": "Jane",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD",
  "experience": "10",
  "licenseNumber": "DOC12345",
  "consultationFee": "500",
  "about": "Experienced cardiologist...",
  "address": "456 Medical Plaza",
  "city": "Boston",
  "state": "MA",
  "zipCode": "02101"
}
```

**Success Response (Patient):**
```json
{
  "message": "Patient account created successfully",
  "user": {
    "id": "clxxx...",
    "email": "patient@example.com",
    "role": "PATIENT"
  }
}
```

**Success Response (Doctor):**
```json
{
  "message": "Doctor account created successfully. Your account is pending verification by an administrator.",
  "user": {
    "id": "clxxx...",
    "email": "doctor@example.com",
    "role": "DOCTOR"
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `400`: User already exists (email or phone)
- `400`: License number already exists (doctors)
- `500`: Internal server error

---

## 🎨 User Experience

### Patient Registration Flow
1. Visit `/register`
2. Click "Register as Patient"
3. Fill out comprehensive form
4. Submit registration
5. See success message
6. Redirect to login page
7. Login immediately
8. Access patient portal

### Doctor Registration Flow
1. Visit `/register`
2. Click "Register as Doctor"
3. Fill out professional information
4. Submit registration
5. See verification pending message
6. Redirect to login page
7. **Cannot login until admin verifies account**
8. Receive notification when verified
9. Login and access doctor portal

---

## 🔄 Authentication Integration

### Session Management
After successful registration and login, the session includes:
```typescript
{
  user: {
    id: string
    email: string
    name: string  // "John Doe" or "Dr. Jane Smith"
    role: "PATIENT" | "DOCTOR" | "ADMIN"
    patientId?: string
    doctorId?: string
  }
}
```

### Name Display
- **Patients**: `firstName lastName`
- **Doctors**: `Dr. firstName lastName`
- Used throughout the application for personalization

---

## 📋 Validation Rules

### Email
- Must be valid email format
- Must be unique across all users
- Required field

### Password
- Minimum 6 characters
- Must match confirmation password
- Hashed before storage

### Phone
- Optional field
- Must be unique if provided
- Can be used for SMS notifications (future)

### Patient Specific
- First Name: Required
- Last Name: Required
- Date of Birth: Required, must be valid date
- Gender: Required, must be Male/Female/Other

### Doctor Specific
- All personal fields required
- Specialization: Required, from predefined list
- Qualification: Required, free text
- Experience: Required, must be number ≥ 0
- License Number: Required, must be unique
- Consultation Fee: Required, must be number ≥ 0

---

## 🛠️ Testing

### Test Patient Registration
1. Navigate to http://localhost:3000/register
2. Click "Register as Patient"
3. Fill in test data:
   - Email: `test.patient@example.com`
   - Password: `password123`
   - First Name: `Test`
   - Last Name: `Patient`
   - DOB: `1990-01-01`
   - Gender: `Male`
4. Submit and verify success
5. Login with credentials
6. Verify patient portal access

### Test Doctor Registration
1. Navigate to http://localhost:3000/register
2. Click "Register as Doctor"
3. Fill in test data:
   - Email: `test.doctor@example.com`
   - Password: `password123`
   - First Name: `Test`
   - Last Name: `Doctor`
   - Specialization: `Cardiology`
   - Qualification: `MBBS, MD`
   - Experience: `5`
   - License: `TEST12345`
   - Fee: `500`
4. Submit and verify pending message
5. **Manually activate in database** (for testing):
   ```sql
   UPDATE "User" SET "isActive" = true WHERE email = 'test.doctor@example.com';
   UPDATE "Doctor" SET "licenseVerified" = true, "isAvailable" = true 
   WHERE "userId" = (SELECT id FROM "User" WHERE email = 'test.doctor@example.com');
   ```
6. Login with credentials
7. Verify doctor portal access

---

## 🔜 Future Enhancements

### Email Verification
- [ ] Send verification email on registration
- [ ] Verify email before allowing login
- [ ] Resend verification email option

### Doctor Verification Workflow
- [ ] Admin panel for doctor verification
- [ ] Document upload for credentials
- [ ] Automated license verification API
- [ ] Email notification on approval/rejection

### Enhanced Validation
- [ ] Phone number format validation
- [ ] Address autocomplete
- [ ] Medical license number format validation
- [ ] Profile picture upload

### Social Registration
- [ ] Google OAuth
- [ ] Facebook OAuth
- [ ] LinkedIn OAuth (for doctors)

---

## 🐛 Known Limitations

1. **Email Verification**: Not implemented yet - users can login without verifying email
2. **Doctor Verification**: Manual process - requires database update or admin panel
3. **Profile Pictures**: Not supported in registration
4. **Document Upload**: Not available during registration (doctors need to upload credentials separately)
5. **Password Reset**: Not implemented yet

---

## 📝 Notes

### For Patients
- Account is immediately active
- Can login and book appointments right away
- Can update profile later from dashboard

### For Doctors
- Account requires admin verification
- Cannot login until activated
- Should receive email notification when verified
- Can update profile and schedule after activation

### For Admins
- Need to manually verify doctor accounts
- Should check credentials before activation
- Can use Prisma Studio or admin panel (when built)

---

## ✅ Checklist

- [x] Role selection page
- [x] Patient registration form
- [x] Doctor registration form
- [x] Registration API endpoint
- [x] Password hashing
- [x] Duplicate checking
- [x] Form validation
- [x] Loading states
- [x] Error handling
- [x] Success notifications
- [x] Redirect after registration
- [x] Session integration
- [x] Name display in session
- [ ] Email verification
- [ ] Doctor verification workflow
- [ ] Profile picture upload
- [ ] Password reset

---

**Registration system is now fully functional!** 🎉

Users can register as either patients or doctors with comprehensive profile information. The system handles validation, security, and proper database storage with role-based access control.
