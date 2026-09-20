const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Ensure data folder exists (Support Vercel serverless /tmp filesystem)
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Could not create data dir:', e);
  }
}

const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// If on Vercel, copy initial seed data from project folder to /tmp if available
if (isVercel) {
  const localReg = path.join(__dirname, 'data', 'registrations.json');
  const localSet = path.join(__dirname, 'data', 'settings.json');
  if (fs.existsSync(localReg) && !fs.existsSync(REGISTRATIONS_FILE)) {
    try { fs.copyFileSync(localReg, REGISTRATIONS_FILE); } catch (e) {}
  }
  if (fs.existsSync(localSet) && !fs.existsSync(SETTINGS_FILE)) {
    try { fs.copyFileSync(localSet, SETTINGS_FILE); } catch (e) {}
  }
}

// Initialize registrations store if needed
if (!fs.existsSync(REGISTRATIONS_FILE)) {
  try {
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([], null, 2));
  } catch (e) {}
}

// Initialize settings store if needed
if (!fs.existsSync(SETTINGS_FILE)) {
  try {
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(
        {
          adminWhatsApp: '919343756202',
          adminUsername: 'admin',
          adminPassword: 'admin123',
          eventName: 'AWS Student Builder Community Day @ Rungta University',
          eventDate: 'Coming Soon',
          venue: 'Rungta University Campus'
        },
        null,
        2
      )
    );
  } catch (e) {}
}

// Helpers
function getRegistrations() {
  try {
    const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading registrations:', err);
    return [];
  }
}

function saveRegistrations(data) {
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getSettings() {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data || '{}');
    if (!parsed.adminWhatsApp) parsed.adminWhatsApp = '919343756202';
    return parsed;
  } catch (err) {
    return {
      adminWhatsApp: '919343756202',
      eventName: 'AWS Student Builder Community Day @ Rungta University'
    };
  }
}

function saveSettings(data) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Generate human-friendly ID
function generateRegistrationId(count) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AWS-RU-${randomSuffix}`;
}

// Serve Admin UI directly
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// API: Submit Registration
app.post('/api/register', (req, res) => {
  try {
    const { name, email, phone, branch, year, section } = req.body;

    if (!name || !email || !phone || !branch || !year || !section) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const registrations = getRegistrations();

    // Check duplicate email or phone (optional check)
    const existing = registrations.find(
      r => (r.email && r.email.toLowerCase() === email.toLowerCase()) || r.phone === phone
    );

    const regId = generateRegistrationId(registrations.length);
    const now = new Date();
    const formattedDate = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const newRecord = {
      id: regId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      branch: branch.trim(),
      year: year.trim(),
      section: section.trim().toUpperCase(),
      registeredAt: now.toISOString(),
      formattedDate: formattedDate
    };

    registrations.unshift(newRecord);
    saveRegistrations(registrations);

    const settings = getSettings();

    // Generate formatted WhatsApp message text
    const whatsappText = `🚀 *NEW REGISTRATION — AWS COMMUNITY DAY* 🚀\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎟️ *Pass ID*: #${newRecord.id}\n` +
      `👤 *Student Name*: ${newRecord.name}\n` +
      `📱 *Mobile*: ${newRecord.phone}\n` +
      `📧 *Email*: ${newRecord.email}\n` +
      `🎓 *Branch*: ${newRecord.branch}\n` +
      `📅 *Year*: ${newRecord.year} Year | *Section*: ${newRecord.section}\n` +
      `🏛️ *Venue*: Rungta University Campus\n` +
      `⏰ *Registered On*: ${formattedDate}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *Status*: Confirmed Student Pass`;

    // WhatsApp URLs
    // 1. Direct to Admin (9343756202)
    const targetAdminPhone = (settings.adminWhatsApp || '919343756202').replace(/[^0-9]/g, '');
    const adminPhoneWithCountry = targetAdminPhone.length === 10 ? `91${targetAdminPhone}` : targetAdminPhone;
    const adminWhatsAppUrl = `https://wa.me/${adminPhoneWithCountry}?text=${encodeURIComponent(whatsappText)}`;

    // 2. Direct to Student
    const cleanStudentPhone = newRecord.phone.replace(/[^0-9]/g, '');
    const studentPhoneWithCountry = cleanStudentPhone.length === 10 ? `91${cleanStudentPhone}` : cleanStudentPhone;
    const studentWhatsAppUrl = `https://wa.me/${studentPhoneWithCountry}?text=${encodeURIComponent(whatsappText)}`;

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      registration: newRecord,
      whatsappText: whatsappText,
      studentWhatsAppUrl: studentWhatsAppUrl,
      adminWhatsAppUrl: adminWhatsAppUrl,
      adminConfigured: !!settings.adminWhatsApp,
      isDuplicate: !!existing
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving registration.'
    });
  }
});

// API: Get All Registrations & Stats
app.get('/api/registrations', (req, res) => {
  try {
    const list = getRegistrations();
    const settings = getSettings();

    // Calculate Analytics
    const total = list.length;

    // Registrations today
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = list.filter(r => r.registeredAt && r.registeredAt.startsWith(todayStr)).length;

    // Branch breakdown
    const branchCounts = {};
    const yearCounts = {};
    list.forEach(r => {
      branchCounts[r.branch] = (branchCounts[r.branch] || 0) + 1;
      yearCounts[r.year] = (yearCounts[r.year] || 0) + 1;
    });

    res.json({
      success: true,
      total,
      todayCount,
      branchCounts,
      yearCounts,
      settings,
      registrations: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API: Delete Registration
app.delete('/api/registrations/:id', (req, res) => {
  try {
    const { id } = req.params;
    let list = getRegistrations();
    const initialLength = list.length;
    list = list.filter(r => r.id !== id);

    if (list.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    saveRegistrations(list);
    res.json({ success: true, message: `Registration ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API: Export to Excel (.xlsx)
app.get('/api/export-excel', (req, res) => {
  try {
    const list = getRegistrations();

    // Transform for Excel rows
    const excelData = list.map((item, index) => ({
      'S.No': index + 1,
      'Pass ID': item.id,
      'Full Name': item.name,
      'Email Address': item.email,
      'Mobile Number': item.phone,
      'Branch': item.branch,
      'Year': `${item.year} Year`,
      'Section': item.section,
      'Registered Date & Time': item.formattedDate || item.registeredAt
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-fit column widths
    const columnWidths = [
      { wch: 6 },   // S.No
      { wch: 15 },  // Pass ID
      { wch: 24 },  // Full Name
      { wch: 30 },  // Email
      { wch: 16 },  // Phone
      { wch: 14 },  // Branch
      { wch: 12 },  // Year
      { wch: 10 },  // Section
      { wch: 24 }   // Date & Time
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send file download
    const filename = `AWS_Community_Day_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (err) {
    console.error('Excel Export Error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate Excel file.' });
  }
});

// API: Admin Authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const settings = getSettings();
  const validUser = settings.adminUsername || 'admin';
  const validPass = settings.adminPassword || 'admin123';

  if (username === validUser && password === validPass) {
    const token = Buffer.from(`${validUser}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid username or password.'
  });
});

// API: Get & Update Settings
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: getSettings() });
});

app.post('/api/settings', (req, res) => {
  try {
    const { adminWhatsApp, adminUsername, adminPassword, eventName, venue } = req.body;
    const current = getSettings();
    const updated = {
      ...current,
      adminWhatsApp: adminWhatsApp !== undefined ? adminWhatsApp.trim() : current.adminWhatsApp,
      adminUsername: adminUsername !== undefined ? adminUsername.trim() : (current.adminUsername || 'admin'),
      adminPassword: adminPassword !== undefined ? adminPassword.trim() : (current.adminPassword || 'admin123'),
      eventName: eventName !== undefined ? eventName.trim() : current.eventName,
      venue: venue !== undefined ? venue.trim() : current.venue
    };
    saveSettings(updated);
    res.json({ success: true, message: 'Settings saved successfully.', settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server (Only when not running inside Vercel serverless function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AWS Community Day Server running live!`);
    console.log(`🌐 Website URL:    http://localhost:${PORT}`);
    console.log(`📊 Admin Panel:    http://localhost:${PORT}/admin`);
    console.log(`📥 Excel Export:   http://localhost:${PORT}/api/export-excel`);
    console.log(`====================================================`);
  });
}

module.exports = app;
