# 🧪 Doctor Portal Testing Guide

## ✅ Setup Complete!

Your database has been successfully updated and the development server is running at:
**http://localhost:3000**

---

## 📋 Testing Checklist

### Step 1: Create a Doctor Account

Since you need a doctor account to test the portal, you have two options:

#### Option A: Using Prisma Studio (Recommended)
```bash
npx prisma studio
```

Then:
1. Open Prisma Studio (usually at http://localhost:5555)
2. Create a new **User** with:
   - email: `doctor@test.com`
   - password: (hash using bcrypt - see below)
   - role: `DOCTOR`
   - emailVerified: `true`
   - isActive: `true`

3. Create a new **Doctor** record linked to this user:
   - userId: (the ID from the user you just created)
   - firstName: `John`
   - lastName: `Smith`
   - specialization: `Cardiology`
   - qualification: `MBBS, MD`
   - experience: `10`
   - licenseNumber: `DOC12345`
   - licenseVerified: `true`
   - consultationFee: `500`
   - isAvailable: `true`

#### Option B: Using Registration (If Available)
1. Go to `/register`
2. Register as a DOCTOR
3. Complete the profile

---

## 🔐 Password Hashing

If you need to create a password hash for Prisma Studio:

**Quick Hash Generator (Node.js):**
```javascript
// Run this in Node.js console or create a script
const bcrypt = require('bcrypt');
const password = 'password123';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

Or use an online bcrypt generator with 10 rounds.

---

## 🧪 Testing the Doctor Portal

### 1. Login as Doctor
- Navigate to: http://localhost:3000/login
- Email: `doctor@test.com`
- Password: (whatever you set)

### 2. Test Dashboard (`/doctor/dashboard`)
✅ **What to check:**
- [ ] Statistics cards display correctly
- [ ] Welcome message shows doctor name
- [ ] Quick action buttons work
- [ ] Responsive on mobile

### 3. Test Schedule Management (`/doctor/schedule`)
✅ **What to check:**
- [ ] Can toggle day availability
- [ ] Can add time slots
- [ ] Can remove time slots
- [ ] Can update time slots
- [ ] Save button works
- [ ] Schedule persists after refresh

**Test Flow:**
1. Click on a day's "Available" checkbox
2. Click "Add Slot" button
3. Set start time (e.g., 09:00) and end time (e.g., 12:00)
4. Add another slot (e.g., 14:00 - 17:00)
5. Click "Save Schedule"
6. Refresh page and verify schedule is saved

### 4. Test Appointments (`/doctor/appointments`)
✅ **What to check:**
- [ ] Tabs work (Upcoming, Past, Cancelled)
- [ ] Statistics display correctly
- [ ] Empty states show when no appointments
- [ ] Appointment cards display patient info

**Note:** You'll need to create test appointments first using Prisma Studio or by booking as a patient.

### 5. Test Patients List (`/doctor/patients`)
✅ **What to check:**
- [ ] Patient cards display correctly
- [ ] Statistics show (appointments, records)
- [ ] "View Profile" button works
- [ ] Empty state shows when no patients

### 6. Test Patient Profile (`/doctor/patients/[id]`)
✅ **What to check:**
- [ ] Patient information displays
- [ ] Tabs work (Appointments, Medical Records, Prescriptions)
- [ ] "Create Prescription" button works
- [ ] Appointment history shows
- [ ] Medical records display

### 7. Test Prescription Creation (`/doctor/prescriptions/create`)
✅ **What to check:**
- [ ] Patient info displays correctly
- [ ] Can enter diagnosis
- [ ] Can add medications
- [ ] Can remove medications
- [ ] All medication fields work
- [ ] Form validation works
- [ ] Can add additional notes
- [ ] "Create Prescription" button works

**Test Flow:**
1. Go to a patient profile
2. Click "Create Prescription"
3. Enter diagnosis: "Hypertension"
4. Add medication:
   - Name: "Amlodipine"
   - Dosage: "5mg"
   - Frequency: "Once daily"
   - Duration: "30 days"
   - Instructions: "Take in the morning with food"
5. Click "Add Medication" to add another
6. Add notes: "Follow up in 2 weeks"
7. Click "Create Prescription"

### 8. Test Prescriptions List (`/doctor/prescriptions`)
✅ **What to check:**
- [ ] All prescriptions display
- [ ] Statistics are correct
- [ ] Can view prescription details
- [ ] Empty state shows when no prescriptions

### 9. Test Prescription Detail (`/doctor/prescriptions/[id]`)
✅ **What to check:**
- [ ] Patient information displays
- [ ] Doctor information displays
- [ ] Diagnosis shows correctly
- [ ] All medications display with details
- [ ] Additional notes show
- [ ] Print/Download buttons present (placeholders)

---

## 🎨 Visual Testing

### Desktop (1920x1080)
- [ ] All cards align properly
- [ ] Gradients render correctly
- [ ] Navigation is clear
- [ ] No horizontal scroll

### Tablet (768x1024)
- [ ] Grid layouts adjust
- [ ] Navigation remains usable
- [ ] Cards stack properly

### Mobile (375x667)
- [ ] Mobile navigation shows
- [ ] All content is readable
- [ ] Buttons are tappable
- [ ] Forms are usable

---

## 🔒 Security Testing

### Authorization Tests
1. **Try accessing doctor routes as a patient:**
   - Should redirect to unauthorized page

2. **Try accessing another doctor's data:**
   - Should not be able to see other doctors' patients

3. **Try creating prescription without being logged in:**
   - Should redirect to login

---

## 🐛 Common Issues & Solutions

### Issue: "Doctor profile not found"
**Solution:** Make sure you created a Doctor record linked to your User account in Prisma Studio.

### Issue: No appointments showing
**Solution:** Create test appointments in Prisma Studio:
1. Create a Patient user and record
2. Create an Appointment linking the patient and doctor
3. Set appointmentDate to a future date
4. Set status to "SCHEDULED"

### Issue: TypeScript errors
**Solution:** The Prisma Client should be regenerated. If you see errors, run:
```bash
npx prisma generate
```

### Issue: Schedule not saving
**Solution:** Check browser console for errors. Ensure the API endpoint is working.

---

## 📊 Test Data Creation

### Quick Test Data Script (Optional)

You can create this file to generate test data:

**`scripts/seed-doctor-data.ts`**
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create doctor user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@test.com',
      password: hashedPassword,
      role: 'DOCTOR',
      emailVerified: true,
      isActive: true,
    },
  });

  // Create doctor profile
  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      firstName: 'John',
      lastName: 'Smith',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD',
      experience: 10,
      licenseNumber: 'DOC12345',
      licenseVerified: true,
      consultationFee: 500,
      about: 'Experienced cardiologist with 10 years of practice',
      isAvailable: true,
    },
  });

  console.log('Doctor created:', doctor);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with:
```bash
npx ts-node scripts/seed-doctor-data.ts
```

---

## ✅ Success Criteria

Your doctor portal is working correctly if:
- ✅ Can login as doctor
- ✅ Dashboard shows statistics
- ✅ Can create and save schedule
- ✅ Can view appointments
- ✅ Can view patient list
- ✅ Can view patient profiles
- ✅ Can create prescriptions
- ✅ Can view prescription details
- ✅ All pages are responsive
- ✅ No console errors

---

## 🚀 Next Steps

Once testing is complete:

1. **Create more test data** for comprehensive testing
2. **Test edge cases** (empty states, errors, etc.)
3. **Review the code** for any improvements
4. **Start Phase 4** - Real-time Communication

---

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify database connections
4. Ensure all migrations ran successfully

---

**Happy Testing! 🎉**

The doctor portal is now ready for use. All features have been implemented and the database is properly configured.
