// Dashboard imports for 4 consolidated roles
import AdminDashboard from '../pages/AdminDashboard';
import SalesDashboard from '../pages/SalesDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import ClientDashboard from '../pages/ClientDashboard';

// Shared page imports
import LeadsPage from '../pages/CRM/LeadsPage';
import LeadDetailPage from '../pages/CRM/LeadDetailPage';
import CustomersPage from '../pages/CRM/CustomersPage';
import CustomerDetailPage from '../pages/CRM/CustomerDetailPage';
import QuotesPage from '../pages/CRM/QuotesPage';

import OrdersPage from '../pages/Orders/OrdersPage';
import OrderDetailPage from '../pages/Orders/OrderDetailPage';

import WorkOrdersBoardPage from '../pages/Production/WorkOrdersBoardPage';
import WorkOrderDetailPage from '../pages/Production/WorkOrderDetailPage';
import ProductionSchedulePage from '../pages/Production/ProductionSchedulePage';
import NewWorkOrderPage from '../pages/Production/NewWorkOrderPage';

import MaterialsPage from '../pages/Inventory/MaterialsPage';
import MaterialDetailPage from '../pages/Inventory/MaterialDetailPage';
import PurchaseOrdersPage from '../pages/Inventory/PurchaseOrdersPage';
import PurchaseOrderDetailPage from '../pages/Inventory/PurchaseOrderDetailPage';
import BomTemplatesPage from '../pages/Inventory/BomTemplatesPage';
import SuppliersPage from '../pages/Inventory/SuppliersPage';
import StockMovementsPage from '../pages/Inventory/StockMovementsPage';
import InventoryReportsPage from '../pages/Inventory/InventoryReportsPage';
import ProductsPage from '../pages/Inventory/ProductsPage';

import OperationsReportsPage from '../pages/Reports/OperationsReportsPage';
import ProductionReportsPage from '../pages/Reports/ProductionReportsPage';
import FinancialReportsPage from '../pages/Finance/FinancialReportsPage';

import POSTerminalPage from '../pages/POS/POSTerminalPage';
import PosSalesHistoryPage from '../pages/POS/PosSalesHistoryPage';

import InvoicesPage from '../pages/Finance/InvoicesPage';
import InvoiceDetailPage from '../pages/Finance/InvoiceDetailPage';
import PaymentsPage from '../pages/Finance/PaymentsPage';
import AccountsPage from '../pages/Finance/AccountsPage';
import JournalEntriesPage from '../pages/Finance/JournalEntriesPage';
import JournalEntryDetailPage from '../pages/Finance/JournalEntryDetailPage';

import CampaignsPage from '../pages/Marketing/CampaignsPage';
import CampaignDetailPage from '../pages/Marketing/CampaignDetailPage';
import AdPerformancePage from '../pages/Marketing/AdPerformancePage';
import AdsManagementPage from '../pages/Marketing/AdsManagementPage';

import InboxPage from '../pages/Communications/InboxPage';
import ConversationDetailPage from '../pages/Communications/ConversationDetailPage';

import AiOverviewPage from '../pages/AI/AiOverviewPage';

import UsersPage from '../pages/Admin/UsersPage';
import UserDetailPage from '../pages/Admin/UserDetailPage';
import RolesPage from '../pages/Admin/RolesPage';
import RoleDetailPage from '../pages/Admin/RoleDetailPage';
import AuditLogsPage from '../pages/Admin/AuditLogsPage';
import SystemSettingsPage from '../pages/Admin/SystemSettingsPage';
import ChangePasswordPage from '../pages/Account/ChangePasswordPage';
import FilesPage from '../pages/FilesPage';

export const routes = [
  // Main dashboard routes for 4 consolidated roles
  { path: '/', element: <ClientDashboard /> }, // Default
  
  { path: '/dashboard/admin', element: <AdminDashboard /> },
  { path: '/dashboard/sales', element: <SalesDashboard /> },
  { path: '/dashboard/staff', element: <StaffDashboard /> },
  { path: '/client', element: <ClientDashboard /> },
  
  // Files (available to many roles)
  { path: '/files', element: <FilesPage /> },
  
  // Nested routes under dashboards
  
  // ADMIN nested routes (role_id: 1)
  { path: '/dashboard/admin/finance/invoices', element: <InvoicesPage /> },
  { path: '/dashboard/admin/finance/invoices/:id', element: <InvoiceDetailPage /> },
  { path: '/dashboard/admin/finance/payments', element: <PaymentsPage /> },
  { path: '/dashboard/admin/finance/accounts', element: <AccountsPage /> },
  { path: '/dashboard/admin/finance/journals', element: <JournalEntriesPage /> },
  { path: '/dashboard/admin/finance/journals/:id', element: <JournalEntryDetailPage /> },
  { path: '/dashboard/admin/finance/reports', element: <FinancialReportsPage /> },
  { path: '/dashboard/admin/users', element: <UsersPage /> },
  { path: '/dashboard/admin/users/:id', element: <UserDetailPage /> },
  { path: '/dashboard/admin/roles', element: <RolesPage /> },
  { path: '/dashboard/admin/roles/:id', element: <RoleDetailPage /> },
  { path: '/dashboard/admin/audit-logs', element: <AuditLogsPage /> },
  { path: '/dashboard/admin/system-settings', element: <SystemSettingsPage /> },
  { path: '/dashboard/admin/ai/overview', element: <AiOverviewPage /> },
  
  // SALES nested routes (role_id: 2)
  { path: '/dashboard/sales/crm/leads', element: <LeadsPage /> },
  { path: '/dashboard/sales/crm/leads/:id', element: <LeadDetailPage /> },
  { path: '/dashboard/sales/crm/customers', element: <CustomersPage /> },
  { path: '/dashboard/sales/crm/customers/:id', element: <CustomerDetailPage /> },
  { path: '/dashboard/sales/crm/quotes', element: <QuotesPage /> },
  { path: '/dashboard/sales/orders', element: <OrdersPage /> },
  { path: '/dashboard/sales/orders/:id', element: <OrderDetailPage /> },
  { path: '/dashboard/sales/pos/terminal', element: <POSTerminalPage /> },
  { path: '/dashboard/sales/pos/sales-history', element: <PosSalesHistoryPage /> },
  { path: '/dashboard/sales/marketing/campaigns', element: <CampaignsPage /> },
  { path: '/dashboard/sales/marketing/campaigns/:id', element: <CampaignDetailPage /> },
  { path: '/dashboard/sales/marketing/ad-performance', element: <AdPerformancePage /> },
  { path: '/dashboard/sales/marketing/ads', element: <AdsManagementPage /> },
  { path: '/dashboard/sales/communications/inbox', element: <InboxPage /> },
  { path: '/dashboard/sales/communications/conversations/:id', element: <ConversationDetailPage /> },
  
  // STAFF nested routes (role_id: 3)
  { path: '/dashboard/staff/production/work-orders', element: <WorkOrdersBoardPage /> },
  { path: '/dashboard/staff/production/work-orders/:id', element: <WorkOrderDetailPage /> },
  { path: '/dashboard/staff/production/schedule', element: <ProductionSchedulePage /> },
  { path: '/dashboard/staff/production/new-order', element: <NewWorkOrderPage /> },
  { path: '/dashboard/staff/inventory/materials', element: <MaterialsPage /> },
  { path: '/dashboard/staff/inventory/materials/:sku', element: <MaterialDetailPage /> },
  { path: '/dashboard/staff/inventory/purchase-orders', element: <PurchaseOrdersPage /> },
  { path: '/dashboard/staff/inventory/purchase-orders/:id', element: <PurchaseOrderDetailPage /> },
  { path: '/dashboard/staff/inventory/bom-templates', element: <BomTemplatesPage /> },
  { path: '/dashboard/staff/inventory/suppliers', element: <SuppliersPage /> },
  { path: '/dashboard/staff/inventory/stock-movements', element: <StockMovementsPage /> },
  { path: '/dashboard/staff/inventory/reports', element: <InventoryReportsPage /> },
  { path: '/dashboard/staff/inventory/products', element: <ProductsPage /> },
  { path: '/dashboard/staff/reports/operations', element: <OperationsReportsPage /> },
  { path: '/dashboard/staff/reports/production', element: <ProductionReportsPage /> },
  { path: '/dashboard/staff/crm/customers', element: <CustomersPage /> },
  { path: '/dashboard/staff/crm/customers/:id', element: <CustomerDetailPage /> },
  { path: '/dashboard/staff/orders', element: <OrdersPage /> },
  { path: '/dashboard/staff/orders/:id', element: <OrderDetailPage /> },
  { path: '/dashboard/staff/communications/inbox', element: <InboxPage /> },
  { path: '/dashboard/staff/communications/conversations/:id', element: <ConversationDetailPage /> },
  { path: '/dashboard/staff/pos/terminal', element: <POSTerminalPage /> },
  { path: '/dashboard/staff/pos/sales-history', element: <PosSalesHistoryPage /> },
  
  // CLIENT nested routes (role_id: 4)
  { path: '/client/orders', element: <OrdersPage /> },
  { path: '/client/orders/:id', element: <OrderDetailPage /> },
  { path: '/client/quotes', element: <QuotesPage /> },
  { path: '/client/files', element: <FilesPage /> },
  
  // Account (available to all authenticated users - outside dashboard hierarchy)
  { path: '/account/change-password', element: <ChangePasswordPage /> },
]