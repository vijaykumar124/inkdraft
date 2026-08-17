# 🖋️ InkDraft — Premium Tattoo Studio & Custom Design Platform

A modern, high-performance, full-stack website and admin panel for a tattoo studio, built with **Node.js**, **Express**, **EJS**, and **MongoDB Atlas** (Mongoose).

---

## ✨ Features

- 🎨 **Luxury Dark/Day Aesthetic**: Tailored dark mode with gold accents & instant Day/Night mode toggle button.
- 📱 **Fully Responsive**: Mobile-first layout with smooth animations, scroll progress, counter animations, and interactive modals.
- 🖋️ **Custom Design Order Form**: Detailed client request form with live MongoDB order tracking.
- 🖼️ **Dynamic Portfolio & Styles**: Interactive tattoo categories, featured artwork, and gallery mosaic.
- 👥 **Artist Showcases**: Team profiles, specialties, ratings, and social links.
- 💳 **Pricing Plans**: Tiered packages with highlighted popular tier.
- ⚙️ **Comprehensive Admin Panel**:
  - Secure JWT authentication & bcrypt password hashing
  - Dashboard analytics & order status workflow (`pending`, `reviewing`, `quoted`, `confirmed`, `in-progress`, `completed`)
  - CRUD management for Artists, Designs, Categories, Testimonials, Pricing, and Site Settings.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas / Mongoose
- **Frontend / Templating**: EJS, CSS3 (Vanilla CSS variables), Vanilla JavaScript
- **Auth & Security**: JWT (JSON Web Tokens), bcryptjs, express-session

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd inkdraft-server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from `.env.example`:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
ADMIN_EMAIL=admin@inkdraft.com
ADMIN_PASSWORD=admin123
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` for the public website and `http://localhost:3000/admin/login` for the admin panel.

---

## 📄 License
MIT License
