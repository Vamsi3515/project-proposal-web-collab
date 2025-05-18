# Project Request and Proposal Platform

A full-stack project management platform that allows students to request projects, upload documents, make payments, and track project progress, while admins manage submissions, approve requests, track payments, and generate invoices.

---

## 🌐 Tech Stack

- **Frontend:** Next.js 13+, Tailwind CSS, React Toastify
- **Backend:** Node.js, Express.js, MySQL, Multer, Razorpay, Nodemailer
- **Authentication:** JWT
- **Payment Integration:** Razorpay
- **PDF/Asset Management:** Multer for uploads, HTML-to-PDF invoice generation
- **Other Features:** Report system, admin dashboard, project tracking, secure digital signatures

---

## 📁 Project Structure

```
root/
├── backend/          # Node.js + Express backend
├── frontend/         # Next.js 13+ frontend
├── backend/assets/           # Logo and Signature files used in invoice
├── certificate/          # Google Apps Script for certificate generation
└── README.md         # Project documentation
```

---

## 🚀 Frontend Setup (`frontend/`)

This is a [Next.js](https://nextjs.org) project bootstrapped with `create-next-app`.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the `frontend/` directory and add the following:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
NEXT_PUBLIC_API_URL=YOUR_APP_URL
NEXT_PUBLIC_SERVER_API_URL=YOUR_BACKEND_URL
```

### 3. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Backend Setup (`backend/`)

The backend is built with Node.js, Express.js, and MySQL.

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file inside `backend/` directory:

```env
# Server
PORT=

# MySQL Database
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=project_proposal_web

# JWT
JWT_SECRET=a1b2c3

# Nodemailer
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Admin Credentials
ADMIN_USER=admin_email@gmail.com
ADMIN_PASS=admin_password

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Certificate Generation Key
CERTIFICATE_SECRET_KEY=321BJVEU2G82424438GB

# Server Public Domain
PUBLIC_DOMAIN=https://your-backend-domain.com
```

> ⚠️ Make sure database `project_proposal_web` exists and all required tables are created.

### 3. Replace assets

Replace `logo.png` and `signature.png` in the `/assets/` folder. These are used in generating invoices and certificates.

### 4. Create admin account

To create the initial admin account:

```bash
node createAdmin.js
```

Ensure that `ADMIN_USER` and `ADMIN_PASS` are correctly set in your `.env` before running this script.

### 5. Start the backend server

```bash
npm start
```

---

## 🧪 Key Features

### ✨ Student Side
- Register/login with OTP email verification
- Request new projects by domain
- Team management (up to 10 members)
- Download domain-related reference PDFs
- Sign terms and conditions digitally
- Track project approval status and notes
- Make partial/full Razorpay payments
- View invoices and download completed projects
- Report issues (with images/PDFs)

### 🔐 Admin Side
- Secure admin login with credentials from `.env`
- View and manage all project requests
- Approve/reject with price input and admin notes
- Upload final project files (ZIP/PDF)
- Track full/partial payments
- Generate and manage invoices
- View and close user-reported issues
- Delete projects only after completed refunds

---

## 🧾 Certificate Generation

Internship certificates are auto-generated using Google Slides, Google Sheets, and Google Apps Script.

### 🔧 Setup Instructions

1. **Create Google Drive Folder:** Copy the folder ID.
2. **Create Google Slides Template:** Name it `internship certificate`. Copy the template ID.
3. **Create Google Sheet:** Name it `internship certificate`. Add required fields like name, college, role, start, end, email, etc.
4. **Setup Apps Script:** The Google Apps Script file is available in the `scripts/` folder. Open it in Google Apps Script editor.
5. **verified.png:** You must add verified logo with this same name in drive folder (Don't run script without adding verified.png)

Update the following variables in the script:

```javascript
const templateId = 'YOUR_SLIDE_TEMPLATE_ID';
const folderId = 'YOUR_GOOGLE_DRIVE_FOLDER_ID';
const domain = 'https://your-website.com';
const secret = '321BJVEU2G82424438GB'; // Must match CERTIFICATE_SECRET_KEY in .env
```

> Ensure that the `CERTIFICATE_SECRET_KEY` in `.env` matches the `secret` in the Google Apps Script.

---

## 📄 Deployment Notes

- Frontend and backend must be hosted on HTTPS-enabled domains (especially for Razorpay).
- Ensure CORS is properly set in backend.
- Replace dummy logos, keys, and email credentials with production-level assets and accounts.

---

## 📦 Recommended Deployment Platforms

| Component  | Recommended Hosting              |
|------------|----------------------------------|
| Frontend   | Vercel / Netlify                 |
| Backend    | Render / Railway / DigitalOcean  |
| Database   | PlanetScale / ClearDB / MySQL    |
| File Uploads | AWS S3 / Cloudinary (Optional) |

---

## 🧠 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Node.js Docs](https://nodejs.org/en/docs)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [Razorpay Docs](https://razorpay.com/docs/)
- [Nodemailer Docs](https://nodemailer.com/about/)

---

## 👥 Created By

- **Vamsi Krishna** & **Purna** 

---

## 📌 Final Notes

Please ensure `.env` and `.env.local` files are properly set before running the app. The app will not function without correct Razorpay, DB, and email credentials.
