import AdminDashboard from '../pages/AdminDashboard';
import OwnerDashboard from '../pages/OwnerDashboard';
import ReceptionDashboard from '../pages/ReceptionDashboard';
import AccountantDashboard from '../pages/AccountantDashboard';
import MarketingDashboard from '../pages/MarketingDashboard';
import TechnicianDashboard from '../pages/TechnicianDashboard';
import ControllerDashboard from '../pages/ControllerDashboard';
import ProductionDashboard from '../pages/ProductionDashboard';
import InventoryDashboard from '../pages/InventoryDashboard';
import SalesDashboard from '../pages/SalesDashboard';
import PosDashboard from '../pages/PosDashboard';
import SupportDashboard from '../pages/SupportDashboard';
import GlobalDashboard from '../pages/GlobalDashboard';
import ProtectedRoute from '../components/auth/ProtectedRoute';

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
import MaterialPricingPage from '../pages/Inventory/MaterialPricingPage';
import MaterialSalesPage from '../pages/Inventory/MaterialSalesPage';
import PurchaseOrdersPage from '../pages/Inventory/PurchaseOrdersPage';
import PurchaseOrderDetailPage from '../pages/Inventory/PurchaseOrderDetailPage';
import BomTemplatesPage from '../pages/Inventory/BomTemplatesPage';
import SuppliersPage from '../pages/Inventory/SuppliersPage';
import StockMovementsPage from '../pages/Inventory/StockMovementsPage';
import InventoryReportsPage from '../pages/Inventory/InventoryReportsPage';
import ProductsPage from '../pages/Inventory/ProductsPage';
import OperationsReportsPage from '../pages/Reports/OperationsReportsPage';
import ProductionReportsPage from '../pages/Reports/ProductionReportsPage';

import POSTerminalPage from '../pages/POS/PosTerminalPage';
import PosSalesHistoryPage from '../pages/POS/PosSalesHistoryPage';

import InvoicesPage from '../pages/Finance/InvoicesPage';
import InvoiceDetailPage from '../pages/Finance/InvoiceDetailPage';
import PaymentsPage from '../pages/Finance/PaymentsPage';
import AccountsPage from '../pages/Finance/AccountsPage';
import JournalEntriesPage from '../pages/Finance/JournalEntriesPage';
import JournalEntryDetailPage from '../pages/Finance/JournalEntryDetailPage';
import FinancialReportsPage from '../pages/Finance/FinancialReportsPage';

import CampaignsPage from '../pages/Marketing/CampaignsPage';
import CampaignDetailPage from '../pages/Marketing/CampaignDetailPage';
import AdPerformancePage from '../pages/Marketing/AdPerformancePage';
import AdsManagementPage from '../pages/Marketing/AdsManagementPage';

import InboxPage from '../pages/Communications/InboxPage';
import ConversationDetailPage from '../pages/Communications/ConversationDetailPage';

import AiOverviewPage from '../pages/AI/AiOverviewPage';

import UsersPage from '../pages/Admin/UsersPage';
import UserDetailPage from '../pages/Admin/UserDetailPage';
import UserPermissionsPage from '../pages/Admin/UserPermissionsPage';
import RolesPage from '../pages/Admin/RolesPage';
import RoleDetailPage from '../pages/Admin/RoleDetailPage';
import AuditLogsPage from '../pages/Admin/AuditLogsPage';
import SystemSettingsPage from '../pages/Admin/SystemSettingsPage';
import EmployeeActivityPage from '../pages/Admin/EmployeeActivityPage';
import ChangePasswordPage from '../pages/Account/ChangePasswordPage';
import FilesPage from '../pages/FilesPage';

// Helper function to create protected route
// Permission will be automatically derived from route path in ProtectedRoute component
const createProtectedRoute = (path: string, element: React.ReactElement) => {
  return {
    path,
    element: <ProtectedRoute>{element}</ProtectedRoute>
  }
}

export const routes = [
  // Dashboard routes - accessible to all authenticated users
  { path: '/', element: <GlobalDashboard /> },
  { path: '/dashboard', element: <GlobalDashboard /> },
  { path: '/dashboard/global', element: <GlobalDashboard /> },
  
  // Keep role-specific dashboards for backward compatibility
  { path: '/dashboard/owner', element: <OwnerDashboard /> },
  { path: '/dashboard/admin', element: <AdminDashboard /> },
  { path: '/dashboard/reception', element: <ReceptionDashboard /> },
  { path: '/dashboard/accountant', element: <AccountantDashboard /> },
  { path: '/dashboard/marketing', element: <MarketingDashboard /> },
  { path: '/dashboard/technician', element: <TechnicianDashboard /> },
  { path: '/dashboard/controller', element: <ControllerDashboard /> },
  { path: '/dashboard/production', element: <ProductionDashboard /> },
  { path: '/dashboard/inventory', element: <InventoryDashboard /> },
  { path: '/dashboard/sales', element: <SalesDashboard /> },
  { path: '/dashboard/pos', element: <PosDashboard /> },
  { path: '/dashboard/support', element: <SupportDashboard /> },

  // Protected routes with permission checks
  createProtectedRoute('/files', <FilesPage />),
  createProtectedRoute('/crm/leads', <LeadsPage />),
  createProtectedRoute('/crm/leads/:id', <LeadDetailPage />),
  createProtectedRoute('/crm/customers', <CustomersPage />),
  createProtectedRoute('/crm/customers/:id', <CustomerDetailPage />),
  createProtectedRoute('/crm/quotes', <QuotesPage />),
  createProtectedRoute('/orders', <OrdersPage />),
  createProtectedRoute('/orders/:id', <OrderDetailPage />),
  createProtectedRoute('/production/work-orders', <WorkOrdersBoardPage />),
  createProtectedRoute('/production/work-orders/:id', <WorkOrderDetailPage />),
  createProtectedRoute('/production/schedule', <ProductionSchedulePage />),
  createProtectedRoute('/production/new-order', <NewWorkOrderPage />),
  createProtectedRoute('/inventory/materials', <MaterialsPage />),
  createProtectedRoute('/inventory/materials/:sku', <MaterialDetailPage />),
  createProtectedRoute('/inventory/material-pricing', <MaterialPricingPage />),
  createProtectedRoute('/inventory/material-sales', <MaterialSalesPage />),
  createProtectedRoute('/inventory/purchase-orders', <PurchaseOrdersPage />),
  createProtectedRoute('/inventory/purchase-orders/:id', <PurchaseOrderDetailPage />),
  createProtectedRoute('/inventory/bom-templates', <BomTemplatesPage />),
  createProtectedRoute('/inventory/suppliers', <SuppliersPage />),
  createProtectedRoute('/inventory/stock-movements', <StockMovementsPage />),
  createProtectedRoute('/inventory/reports', <InventoryReportsPage />),
  createProtectedRoute('/inventory/products', <ProductsPage />),
  createProtectedRoute('/reports/operations', <OperationsReportsPage />),
  createProtectedRoute('/reports/production', <ProductionReportsPage />),
  createProtectedRoute('/pos/terminal', <POSTerminalPage />),
  createProtectedRoute('/pos/sales-history', <PosSalesHistoryPage />),
  createProtectedRoute('/finance/invoices', <InvoicesPage />),
  createProtectedRoute('/finance/invoices/:id', <InvoiceDetailPage />),
  createProtectedRoute('/finance/payments', <PaymentsPage />),
  createProtectedRoute('/finance/accounts', <AccountsPage />),
  createProtectedRoute('/finance/journals', <JournalEntriesPage />),
  createProtectedRoute('/finance/journals/:id', <JournalEntryDetailPage />),
  createProtectedRoute('/finance/reports', <FinancialReportsPage />),
  createProtectedRoute('/marketing/campaigns', <CampaignsPage />),
  createProtectedRoute('/marketing/campaigns/:id', <CampaignDetailPage />),
  createProtectedRoute('/marketing/ad-performance', <AdPerformancePage />),
  createProtectedRoute('/marketing/ads', <AdsManagementPage />),
  createProtectedRoute('/communications/inbox', <InboxPage />),
  createProtectedRoute('/communications/conversations/:id', <ConversationDetailPage />),
  createProtectedRoute('/ai/overview', <AiOverviewPage />),
  createProtectedRoute('/admin/users', <UsersPage />),
  createProtectedRoute('/admin/users/:id', <UserDetailPage />),
  createProtectedRoute('/admin/users/:user_id/permissions', <UserPermissionsPage />),
  createProtectedRoute('/admin/roles', <RolesPage />),
  createProtectedRoute('/admin/roles/:id', <RoleDetailPage />),
  createProtectedRoute('/admin/audit-logs', <AuditLogsPage />),
  createProtectedRoute('/admin/employee-activity', <EmployeeActivityPage />),
  createProtectedRoute('/admin/system-settings', <SystemSettingsPage />),
  { path: '/account/change-password', element: <ChangePasswordPage /> }, // Everyone can change password
]