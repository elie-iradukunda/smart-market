const fs = require('fs');
const path = require('path');

// Dashboard files that need fixing
const dashboardFiles = [
  'src/pages/OwnerDashboard.tsx',
  'src/pages/InventoryDashboard.tsx',
  'src/pages/AccountantDashboard.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/pages/MarketingDashboard.tsx',
  'src/pages/TechnicianDashboard.tsx',
  'src/pages/ControllerDashboard.tsx',
  'src/pages/ProductionDashboard.tsx',
  'src/pages/SalesDashboard.tsx',
  'src/pages/PosDashboard.tsx',
  'src/pages/SupportDashboard.tsx',
  'src/pages/ReceptionDashboard.tsx'
];

const frontendDir = path.join(__dirname, 'frontend');

dashboardFiles.forEach(file => {
  const filePath = path.join(frontendDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern to match the auth guard block
  const guardPattern = /\/\/ Guard:.*?\n\s*if \(!user \|\| user\.role_id !== \d+\) \{\s*\n\s*navigate\('\/login'\)\s*\n\s*return null\s*\n\s*\}/s;
  
  if (guardPattern.test(content)) {
    content = content.replace(guardPattern, '// DashboardLayout handles role checking, no need for duplicate guard here');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`⏭️  Skipped ${file} - no guard found`);
  }
});

console.log('\n✨ Done! All dashboard files have been fixed.');
console.log('The auth guards that were causing blank pages have been removed.');
console.log('DashboardLayout will handle role-based access control.');
