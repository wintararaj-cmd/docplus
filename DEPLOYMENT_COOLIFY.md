# 🚀 Deploying DocPlus to Coolify

This guide details how to deploy your application (Next.js App + Socket.io Server + PostgreSQL) to Coolify.

## 🏗️ Architecture Overview

The system consists of three distinct services:
1.  **Database**: PostgreSQL (Stores user data).
2.  **Frontend/API**: Next.js App (Runs the UI and REST APIs).
3.  **Real-time Server**: Node.js Socket Server (Handles chat).

You will create **two applications** and **one database** in your Coolify project.

---

## 1️⃣ Service 1: PostgreSQL Database

1.  Open your Coolify Project.
2.  Click **+ New** -> **Database** -> **PostgreSQL**.
3.  Name it `docplus-db`.
4.  Once created, copy the **Connection String** (Internal URL).
    *   It looks like: `postgresql://postgres:password@host:5432/postgres`

---

## 2️⃣ Service 2: Socket.io Server (Deploy this first!)

*The Frontend needs the Socket URL to build/connect, so we deploy this first.*

1.  Click **+ New** -> **Application** -> **Public Repository**.
2.  Enter your Repository URL: `https://github.com/wintararaj-cmd/docplus`
3.  Branch: `main`
4.  Build Pack: **Nixpacks** (Default).
5.  **Configuration**:
    *   **Port**: `3002` (The port our code listens on).
    *   **Start Command**: `npm run socket`
    *   **Install Command**: `npm install`
6.  **Environment Variables**:
    *   `SOCKET_PORT`: `3002`
    *   `DATABASE_URL`: `[Paste your PostgreSQL Connection String here]`
    *   `NEXTAUTH_URL`: `[URL of your Frontend, e.g. https://docplus.your-domain.com]` (Allows CORS).
7.  **Deploy**.
8.  Once live, copy the public URL (e.g., `https://socket-docplus.your-domain.com`). This will be your `NEXT_PUBLIC_SOCKET_URL`.

---

## 3️⃣ Service 3: Frontend (Next.js)

1.  Click **+ New** -> **Application** -> **Public Repository**.
2.  Enter the same Repository URL.
3.  Branch: `main`
4.  Build Pack: **Nixpacks** (Default).
5.  **Configuration**:
    *   **Port**: `3000`
    *   **Build Command**: `npm run db:generate && npm run build`
        *   *Note: We run db:generate to ensure Prisma Client is ready.*
    *   **Start Command**: `npm run db:deploy && npm run start`
        *   *Note: This runs migrations to create tables before starting the app.*
6.  **Environment Variables**:
    *   `DATABASE_URL`: `[Paste your PostgreSQL Connection String]`
    *   `NEXTAUTH_URL`: `[This Service's Public URL]`
    *   `NEXTAUTH_SECRET`: `[Generate a random string]`
    *   `NEXT_PUBLIC_SOCKET_URL`: `[The URL of your Socket Server from Step 2]`
    *   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: (If using Google Auth).
    *   `EMAIL_SERVER_...`: (If using Email).
7.  **Deploy**.

---

## 📋 Environment Variables Checklist

### Socket Server (.env)
```env
SOCKET_PORT=3002
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-frontend-url.com
```

### Frontend Server (.env)
```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://your-frontend-url.com
NEXTAUTH_SECRET=super_secret_key_change_me

# Socket Connection
NEXT_PUBLIC_SOCKET_URL=https://your-socket-url.com

# Optional (If used)
# EMAIL_SERVER_HOST=...
# TWILIO_ACCOUNT_SID=...
```

## 🛠️ Troubleshooting

-   **Prisma Client Error**: If you see errors about Prisma Client not being found, ensure your **Build Command** for the Frontend includes `npm run db:generate` (or `npx prisma generate`).
-   **CORS Error**: Ensure `NEXTAUTH_URL` in the **Socket Server** environment variables matches exactly the URL of your Frontend (no trailing slash).
-   **Socket Connection Fail**: Check the browser console. If `NEXT_PUBLIC_SOCKET_URL` is undefined, you might need to rebuild the Frontend after setting the Env Var.
