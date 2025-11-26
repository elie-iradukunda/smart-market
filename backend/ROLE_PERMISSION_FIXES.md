# Smart Market Role Permission Fixes

## 🎯 CURRENT vs RECOMMENDED DISTRIBUTION

### **Owner (Role 1)** ✅ CORRECT
- **Current**: All permissions
- **Status**: Perfect - business owner needs full access

### **Sys Admin (Role 2)** ✅ CORRECT  
- **Current**: System management + reports
- **Status**: Appropriate for technical administration

### **Accountant (Role 3)** ⚠️ NEEDS IMPROVEMENT
- **Current**: invoice.create, payment.create, journal.create, pos.create, report.view
- **Missing**: invoice.send, payment.refund, supplier.view (for expense tracking)
- **Add**: invoice.send, payment.refund, supplier.view

### **Controller (Role 4)** ❌ NEEDS MAJOR CHANGES
- **Current**: report.view, inventory.manage, material.view, payment.view, invoice.view
- **Problem**: Too much finance access, should focus on operations
- **Fix**: Remove payment.view, invoice.view. Add: order.view, workorder.view, production oversight

### **Reception (Role 5)** ⚠️ NEEDS IMPROVEMENT
- **Current**: customer.manage, lead.manage, quote.manage, material.view
- **Missing**: file.upload (for artwork), pos.create (front desk sales)
- **Add**: file.upload, pos.create

### **Technician (Role 6)** ⚠️ NEEDS IMPROVEMENT
- **Current**: worklog.create, workorder.update, order.update, material.view
- **Missing**: file.view (to see artwork), workorder.view (to see assignments)
- **Add**: file.view, workorder.view

### **Production Manager (Role 7)** ✅ MOSTLY CORRECT
- **Current**: Full production + inventory + reports
- **Status**: Good coverage for production oversight

### **Inventory Manager (Role 8)** ✅ CORRECT
- **Current**: inventory.manage, material.view, report.view
- **Status**: Perfect for inventory control

### **Sales Rep (Role 9)** ❌ NEEDS MAJOR CHANGES
- **Current**: customer.manage, lead.manage, quote.manage
- **Missing**: quote.approve (close deals), pos.create (direct sales), file.upload (proposals)
- **Add**: quote.approve, pos.create, file.upload

### **Marketing Manager (Role 10)** ⚠️ NEEDS IMPROVEMENT
- **Current**: campaign.manage, adperformance.view, lead.manage, report.view, ai.view
- **Missing**: customer.view (for targeting), file.upload (for creative assets)
- **Add**: customer.view, file.upload

### **POS Cashier (Role 11)** ✅ CORRECT
- **Current**: pos.create, payment.create, payment.view
- **Status**: Perfect for cashier operations

### **Support Agent (Role 12)** ❌ NEEDS CHANGES
- **Current**: conversation.view, message.send, customer.manage, quote.view, invoice.view
- **Problem**: customer.manage is too broad (should be view-only)
- **Fix**: Replace customer.manage with customer.view

## 🔧 MISSING CRITICAL PERMISSIONS

The system needs these additional permissions:
- `file.upload` - Upload artwork/documents
- `file.view` - View uploaded files  
- `quote.approve` - Approve quotes to convert to orders
- `invoice.send` - Send invoices to customers
- `payment.refund` - Process payment refunds
- `campaign.launch` - Launch marketing campaigns

## 📊 BUSINESS WORKFLOW ALIGNMENT

### **Customer Journey Permissions**
1. **Lead Creation**: Reception, Sales Rep, Marketing ✅
2. **Quote Creation**: Reception, Sales Rep ✅  
3. **Quote Approval**: Sales Rep, Manager ❌ (Missing quote.approve)
4. **Order Processing**: Production Manager, Technician ✅
5. **Invoicing**: Accountant ✅
6. **Payment**: Accountant, Cashier ✅

### **File Management Workflow**
1. **Artwork Upload**: Reception, Sales Rep ❌ (Missing file.upload)
2. **File Viewing**: Technician, Production ❌ (Missing file.view)
3. **Marketing Assets**: Marketing Manager ❌ (Missing file.upload)

## 🎯 PRIORITY FIXES

### **HIGH PRIORITY**
1. Add `file.upload` to Reception, Sales Rep, Marketing Manager
2. Add `quote.approve` to Sales Rep  
3. Fix Controller role (remove finance access, add operations)
4. Fix Support Agent (change to view-only customer access)

### **MEDIUM PRIORITY**  
1. Add `file.view` to Technician, Production Manager
2. Add `invoice.send` to Accountant
3. Add `campaign.launch` to Marketing Manager

### **LOW PRIORITY**
1. Add granular report permissions by type
2. Add `payment.refund` to Accountant
3. Add `supplier.view` to Accountant