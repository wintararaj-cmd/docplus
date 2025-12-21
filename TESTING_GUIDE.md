# 🧪 Quick Testing Guide

## 🚀 **Quick Start - Test Everything in 5 Minutes**

### Step 1: Start the Server (if not running)
```bash
npm run dev
```

### Step 2: Test Admin Login
1. Go to: http://localhost:3000/login
2. Email: `admin@test.com`
3. Password: `admin123`
4. Click "Sign In"
5. ✅ Should redirect to `/admin/dashboard`

### Step 3: Test Doctor Verification
1. From admin dashboard, click **"Review Now"** or **"Verify Doctors"**
2. You should see: `doctor.pending@test.com`
3. Click **"Verify & Activate"** button
4. ✅ Doctor should disappear from list
5. ✅ Toast notification: "Doctor verified successfully!"

### Step 4: Test Verified Doctor Login
1. Logout (or open incognito window)
2. Go to: http://localhost:3000/login
3. Email: `doctor.pending@test.com`
4. Password: `password123`
5. Click "Sign In"
6. ✅ Should redirect to `/doctor/dashboard`

### Step 5: Test Users Management
1. Login as admin again
2. Go to: http://localhost:3000/admin/users
3. Try searching for "patient"
4. Try filtering by role: "PATIENT"
5. Try filtering by status: "ACTIVE"
6. ✅ Should see filtered results

### Step 6: Test Doctors Management
1. Still logged in as admin
2. Go to: http://localhost:3000/admin/doctors
3. ✅ Should see all 6 doctors in grid view
4. ✅ Should see statistics at top

### Step 7: Test New Registration
1. Logout
2. Go to: http://localhost:3000/register
3. Click "Register as Patient"
4. Fill in the form:
   - Email: `newpatient@test.com`
   - Password: `password123`
   - First Name: `Test`
   - Last Name: `Patient`
   - DOB: `1995-01-01`
   - Gender: `Male`
5. Click "Create Patient Account"
6. ✅ Should see success message
7. ✅ Check terminal/console for verification link

### Step 8: Test Email Verification
1. Copy the verification link from console
2. Paste in browser
3. ✅ Should see "Email Verified!" page
4. Click "Continue to Login"
5. Login with new credentials
6. ✅ Should access patient dashboard

---

## 🎯 **Feature-by-Feature Testing**

### Admin Dashboard
**URL**: `/admin/dashboard`
**Login**: admin@test.com / admin123

**Test:**
- [ ] Statistics cards show correct numbers
- [ ] Pending verification alert appears (if pending doctors exist)
- [ ] "Review Now" button works
- [ ] Quick action buttons navigate correctly

### Pending Doctors Verification
**URL**: `/admin/doctors/pending`
**Login**: admin@test.com / admin123

**Test:**
- [ ] List shows all unverified doctors
- [ ] Doctor information displays correctly
- [ ] "Verify & Activate" button works
- [ ] "Reject" button works (with confirmation)
- [ ] Toast notifications appear
- [ ] List updates in real-time

### Users Management
**URL**: `/admin/users`
**Login**: admin@test.com / admin123

**Test:**
- [ ] All users display in table
- [ ] Search by email works
- [ ] Search by name works
- [ ] Filter by role works
- [ ] Filter by status works
- [ ] Statistics update with filters
- [ ] Activate/Deactivate button works
- [ ] Cannot deactivate admin users

### Doctors Management
**URL**: `/admin/doctors`
**Login**: admin@test.com / admin123

**Test:**
- [ ] All doctors show in grid
- [ ] Statistics are correct
- [ ] Verification badges show correctly
- [ ] Professional info displays
- [ ] Appointment counts show
- [ ] Rating displays
- [ ] "Pending Verification" button shows count

### Email Verification
**URL**: `/verify-email?token=...`

**Test:**
- [ ] Valid token shows success
- [ ] Invalid token shows error
- [ ] Expired token shows expired message
- [ ] Already verified shows appropriate message
- [ ] Different messages for doctors vs patients
- [ ] "Continue to Login" button works

### Resend Verification
**URL**: `/resend-verification`

**Test:**
- [ ] Email input works
- [ ] Submit generates new token
- [ ] Success message appears
- [ ] New link appears in console
- [ ] Already verified email shows error
- [ ] Non-existent email doesn't reveal info

---

## 🔍 **Common Issues & Solutions**

### Issue: Can't login as doctor
**Cause**: Doctor not verified yet
**Solution**: Login as admin and verify the doctor first

### Issue: Email verification link doesn't work
**Cause**: Token expired (24 hours)
**Solution**: Use "Resend Verification" page

### Issue: Admin panel shows 403 Unauthorized
**Cause**: Not logged in as admin
**Solution**: Login with admin@test.com / admin123

### Issue: Dashboard 404 error
**Cause**: Old cache
**Solution**: Hard refresh (Ctrl+Shift+R) or restart dev server

---

## 📋 **Test Accounts Reference**

| Email | Password | Role | Status | Use For |
|-------|----------|------|--------|---------|
| admin@test.com | admin123 | Admin | Active | Admin panel testing |
| patient@test.com | password123 | Patient | Active | Patient portal testing |
| doctor@test.com | password123 | Doctor | Verified | Doctor portal testing |
| doctor.pending@test.com | password123 | Doctor | Pending | Verification workflow testing |
| emily.brown@test.com | password123 | Doctor | Verified | Additional doctor testing |
| david.wilson@test.com | password123 | Doctor | Verified | Additional doctor testing |
| lisa.martinez@test.com | password123 | Doctor | Verified | Additional doctor testing |

---

## ✅ **Quick Verification Checklist**

### Admin Features
- [ ] Admin can login
- [ ] Admin dashboard loads
- [ ] Can view pending doctors
- [ ] Can verify doctors
- [ ] Can reject doctors
- [ ] Can view all users
- [ ] Can search/filter users
- [ ] Can activate/deactivate users
- [ ] Can view all doctors
- [ ] Statistics are accurate

### Email Features
- [ ] Verification link appears in console
- [ ] Verification page works
- [ ] Success state displays correctly
- [ ] Error states display correctly
- [ ] Resend verification works
- [ ] New token generates correctly

### User Flows
- [ ] Patient can register
- [ ] Patient can verify email
- [ ] Patient can login
- [ ] Doctor can register
- [ ] Doctor waits for verification
- [ ] Admin can verify doctor
- [ ] Doctor can login after verification
- [ ] Doctor portal accessible

---

## 🎯 **Expected Results**

### After Running Seed Script
```
✅ 7 test accounts created
✅ 1 admin account
✅ 1 patient account
✅ 5 doctor accounts (4 verified, 1 pending)
```

### After Admin Verification
```
✅ Pending doctor count decreases
✅ Verified doctor count increases
✅ Doctor can now login
✅ Doctor portal accessible
```

### After Email Verification
```
✅ User's emailVerified = true
✅ Verification token cleared
✅ User can login
✅ Appropriate portal accessible
```

---

## 🚨 **If Something Doesn't Work**

1. **Check Console/Terminal**
   - Look for error messages
   - Check for verification links

2. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R
   - Or use incognito mode

4. **Check Database**
   ```bash
   npm run db:studio
   ```
   - Verify user exists
   - Check isActive status
   - Check emailVerified status
   - Check licenseVerified (for doctors)

5. **Re-run Seed**
   ```bash
   npm run db:seed
   ```

---

## 🎊 **Success Indicators**

### You'll Know It's Working When:
- ✅ Admin can login and see dashboard
- ✅ Pending doctors list shows correctly
- ✅ Verification workflow completes
- ✅ Verified doctor can login
- ✅ Users management shows all users
- ✅ Search and filters work
- ✅ Email verification links appear in console
- ✅ New registrations work
- ✅ Toast notifications appear
- ✅ No console errors

---

**Happy Testing! 🎉**

*If you encounter any issues, check the console for error messages and refer to the troubleshooting section above.*
