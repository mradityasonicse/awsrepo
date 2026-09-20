const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join('/tmp', 'data');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let list = [];
  try {
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      list = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, 'utf-8') || '[]');
    }
  } catch (e) {}

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

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [
    { wch: 6 }, { wch: 15 }, { wch: 24 }, { wch: 30 },
    { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 24 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  const filename = `AWS_Community_Day_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(excelBuffer);
};
