# Smart Market Backend

Node.js Express backend for the Smart Market Business Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`

3. Create database and run migrations:
```bash
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/users` - Create user (admin only)

### Orders
- `POST /api/quotes` - Create quote
- `PUT /api/quotes/:id/approve` - Approve quote
- `GET /api/orders` - Get orders

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers` - Get customers
- `POST /api/leads` - Create lead

### Inventory
- `POST /api/materials` - Create material
- `GET /api/materials` - Get materials
- `POST /api/stock-movements` - Record stock movement
- `POST /api/purchase-orders` - Create purchase order

### Production
- `POST /api/work-orders` - Create work order
- `PUT /api/work-orders/:id` - Update work order
- `POST /api/work-logs` - Log work time
- `PUT /api/orders/:id/status` - Update order status

### Finance
- `POST /api/invoices` - Create invoice
- `POST /api/payments` - Record payment
- `POST /api/pos-sales` - Create POS sale
- `POST /api/journal-entries` - Create journal entry

### Marketing
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - Get campaigns
- `POST /api/ad-performance` - Record ad performance
- `GET /api/campaigns/:id/performance` - Get campaign performance

### Communication
- `POST /api/conversations` - Create conversation
- `GET /api/conversations` - Get conversations
- `POST /api/messages/send` - Send message
- `GET /api/conversations/:id/messages` - Get messages

### AI & Analytics
- `POST /api/predictions` - Create prediction
- `GET /api/predictions/demand` - Get demand predictions
- `GET /api/reorder-suggestions` - Get reorder suggestions
- `GET /api/customer-insights` - Get customer insights

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/financial` - Financial report
- `GET /api/reports/production` - Production report

### File Upload
- `POST /api/upload/artwork` - Upload artwork file
- `GET /api/files/:id` - Get uploaded file

## Features

- ES6 modules with import/export
- JWT authentication
- Role-based permissions
- MySQL database with connection pooling
- Security middleware (helmet, cors, rate limiting)
- Structured MVC architecture
- File upload handling
- External API integrations (WhatsApp, Facebook, Email)
- Scheduled jobs and automation
- Comprehensive audit logging
- AI predictions and analytics
- Complete business workflow management