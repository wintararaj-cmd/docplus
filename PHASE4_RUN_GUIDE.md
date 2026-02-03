# 🚀 Phase 4: Real-time Communication - Setup Guide

**Status**: Backend & Infrastructure Complete ✅

---

## 📋 What Was Implemented

### 1. Standalone Socket.io Server
- **Location**: `socket/server.ts`
- **Port**: `3002` (Configured to avoid conflict with Next.js)
- **Features**: Authentication, Chat Rooms, Typing Indicators, Online Status
- **Why Standalone?**: Better performance and independent scaling from the Next.js app.

### 2. Frontend Chat Integration
- **Pages Created**:
  - `/patient/chat` - Patient interface
  - `/doctor/chat` - Doctor interface
- **Components**:
  - `ChatWindow` - Main chat UI
  - `ConversationList` - Sidebar list
  - `useSocket` hook - Robust connection logic

### 3. File Upload System
- **API**: `POST /api/chat/upload`
- **Storage**: Local `public/uploads/chat` folder
- **Supports**: Images, PDFs, Documents (Max 5MB)

---

## 🛠️ How to Run the Application

Since we use a separate Socket.io server, you need to run **two terminal commands** to have full functionality.

### Step 1: Start the Socket Server
Open a new terminal and run:

```bash
npm run socket
```
*You should see: `🚀 Socket.io server running on http://localhost:3002`*

### Step 2: Start the Next.js App
In your main terminal run:

```bash
npm run dev
```
*Runs on http://localhost:3000 (or 3001 if 3000 is taken)*

**Note:** I have updated your `.env.local` to use port `3002` for the socket server. Please restart your Next.js server if it was already running.

---

## 🧪 How to Test

### 1. Patient Chat
1. Login as **patient@test.com** / **password123**
2. Go to **Messages** (sidebar or dashboard)
3. Select a doctor to start chatting
4. You should see "● Connected" in the sidebar

### 2. Doctor Chat
1. Open an Incognito window (to simulate 2 users)
2. Login as **doctor@test.com** / **password123**
3. Go to **Messages**
4. You should see messages from the patient instantly!
5. Test typing indicators and read receipts

---

## 🐛 Troubleshooting

- **"Socket disconnected"**: Ensure `npm run socket` is running in a separate terminal.
- **"Connection refused"**: Check if port 3002 is blocked.
- **Upload failed**: Ensure `public/uploads/chat` is writable (automatically created).

---

## 🔜 Phase 5: Admin Panel

Next, we will implement the Admin Dashboard to manage users, view analytics, and monitor the system health.

**Ready to proceed?** 🚀
