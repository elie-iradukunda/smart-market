const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'app.js');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add import for productImageUpload
const importLine = "import ecommerceOrderRoutes from './routes/ecommerceOrders.js';";
const newImport = `import ecommerceOrderRoutes from './routes/ecommerceOrders.js';\nimport productImageUploadRoutes from './routes/productImageUpload.js';`;
content = content.replace(importLine, newImport);

// 2. Add static file serving after body parsing
const bodyParsingEnd = "app.use(express.urlencoded({ extended: true }));";
const staticServing = `app.use(express.urlencoded({ extended: true }));\n\n// Serve static files (uploaded images)\napp.use('/uploads', express.static('public/uploads'));`;
content = content.replace(bodyParsingEnd, staticServing);

// 3. Add route registration
const routesSection = "app.use('/api/ecommerce/orders', ecommerceOrderRoutes);";
const newRoute = `app.use('/api/ecommerce/orders', ecommerceOrderRoutes);\napp.use('/api/upload', productImageUploadRoutes);`;
content = content.replace(routesSection, newRoute);

// Write back
fs.writeFileSync(appPath, content, 'utf8');
console.log('✅ Added product image upload route and static file serving to app.js');
