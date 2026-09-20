# 🚀 AWS Student Builder Community Day Registration Portal

An end-to-end event registration portal and management dashboard built for **AWS Student Builder Community Day @ Rungta University**. Includes live student registration, automatic WhatsApp pass dispatch, password-protected Admin Dashboard, persistent database, and 1-click Excel export.

---

## 🌟 Key Features

### 🎟️ 1. Student Registration Portal (`index.html`)
- **Modern Cyber Theme**: Sleek, glassmorphic dark theme with Google Fonts (Plus Jakarta Sans & JetBrains Mono) and tech blueprint grid.
- **Smart Form Validation**: Collects Student Name, Official Email, Mobile Number, Branch, Year, and Section.
- **Instant Digital Pass**: Generates a unique Pass ID (e.g. `#AWS-RU-1042`) upon submission.
- **Direct WhatsApp Dispatch**: Automatically opens WhatsApp with a pre-formatted message sent directly to the organizer.
- **Google Maps Integration**: Direct link to the campus location on Google Maps.

### 🔐 2. Admin Security Gateway (`admin.html`)
- **Password-Protected Login**: Protected by an authentication gateway.
  - **Default Username**: `admin`
  - **Default Password**: `admin123`
- **Real-Time Analytics Dashboard**:
  - Total Registrations counter
  - Today's Registrations count
  - Branch distribution breakdown
  - WhatsApp integration status
- **Live Search & Filters**: Instant filtering by Name, Phone, Email, Branch, Year, and Pass ID.
- **📊 1-Click Excel Export (.xlsx)**: Downloads a formatted Microsoft Excel spreadsheet with styled headers and auto-fitted columns.
- **📄 CSV Export**: Alternative CSV format export.
- **Direct WhatsApp Chat**: 1-click button on each student row to initiate contact directly.
- **Record Management**: Delete / manage entries with automatic re-sync.

### ⚙️ 3. Backend & Storage (`server.js`)
- Built with **Node.js** and **Express**.
- Auto-persistent JSON storage in `data/registrations.json` and `data/settings.json`.
- Dual-mode offline fallback: Works with the backend server and gracefully falls back to browser `localStorage` if run standalone.

---

## 📁 Project Structure

```
├── index.html            # Main registration landing page & student pass generator
├── admin.html            # Password-protected Admin Dashboard with analytics & table
├── server.js             # Express backend server (REST APIs, Excel generation)
├── package.json          # Node dependencies & project metadata
├── .gitignore            # Git ignore file (excludes node_modules, temp files)
├── data/
│   ├── registrations.json # Persistent database of student registrations
│   └── settings.json     # Configuration (WhatsApp number, admin credentials)
└── README.md             # Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone <your-repository-url>
cd "bhai ka site"
npm install
```

### 2. Start the Live Server
Run the application using:
```bash
npm start
# or
node server.js
```

### 3. Open in Browser
- **Main Website**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Admin Credentials

| Parameter | Value |
| :--- | :--- |
| **Login URL** | `http://localhost:3000/admin` |
| **Username** | `admin` |
| **Password** | `admin123` |

*(Credentials can be updated anytime inside `data/settings.json` or through settings).*

---

## 📱 WhatsApp Integration Details

When a student registers, a formatted message is generated:

```text
🚀 *NEW REGISTRATION — AWS COMMUNITY DAY* 🚀
━━━━━━━━━━━━━━━━━━━━
🎟️ *Pass ID*: #AWS-RU-7253
👤 *Student Name*: Rahul Sahu
📱 *Mobile*: 9876543210
📧 *Email*: rahul@rungta.ac.in
🎓 *Branch*: CSE
📅 *Year*: 4 Year | *Section*: A
🏛️ *Venue*: Rungta University Campus
⏰ *Registered On*: 20 Sept 2026, 1:33 pm
━━━━━━━━━━━━━━━━━━━━
✅ *Status*: Confirmed Student Pass
```

---

## 🛠️ Built With

- **Frontend**: HTML5, CSS3 (Modern Glassmorphism & Cyber Theme), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Spreadsheet Generation**: SheetJS (`xlsx`)
- **Icons & Fonts**: Google Fonts (Plus Jakarta Sans, JetBrains Mono)
- **APIs**: WhatsApp Click-to-Chat (`wa.me`), Google Maps API

---

## 📄 License

This project is licensed under the MIT License — feel free to use and customize it for your campus events!
