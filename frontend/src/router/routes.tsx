import React from 'react';

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

import LeadsPage from '../pages/CRM/LeadsPage';
import LeadDetailPage from '../pages/CRM/LeadDetailPage';
import CustomersPage from '../pages/CRM/CustomersPage';
import CustomerDetailPage from '../pages/CRM/CustomerDetailPage';
import QuotesPage from '../pages/CRM/QuotesPage';

import OrdersPage from '../pages/Orders/OrdersPage';
import OrderDetailPage from '../pages/Orders/OrderDetailPage';

import WorkOrdersBoardPage from '../pages/Production/WorkOrdersBoardPage';
import WorkOrderDetailPage from '../pages/Production/WorkOrderDetailPage';

import MaterialsPage from '../pages/Inventory/MaterialsPage';
import MaterialDetailPage from '../pages/Inventory/MaterialDetailPage';
import PurchaseOrdersPage from '../pages/Inventory/PurchaseOrdersPage';
import PurchaseOrderDetailPage from '../pages/Inventory/PurchaseOrderDetailPage';
import BomTemplatesPage from '../pages/Inventory/BomTemplatesPage';
import SuppliersPage from '../pages/Inventory/SuppliersPage';
import StockMovementsPage from '../pages/Inventory/StockMovementsPage';
import InventoryReportsPage from '../pages/Inventory/InventoryReportsPage';

import PosTerminalPage from '../pages/POS/PosTerminalPage';
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

export const routes = [
  { path: '/', element: <AdminDashboard /> },

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

  { path: '/crm/leads', element: <LeadsPage /> },
  { path: '/crm/leads/:id', element: <LeadDetailPage /> },
  { path: '/crm/customers', element: <CustomersPage /> },
  { path: '/crm/customers/:id', element: <CustomerDetailPage /> },
  { path: '/crm/quotes', element: <QuotesPage /> },

  { path: '/orders', element: <OrdersPage /> },
  { path: '/orders/:id', element: <OrderDetailPage /> },

  { path: '/production/work-orders', element: <WorkOrdersBoardPage /> },
  { path: '/production/work-orders/:id', element: <WorkOrderDetailPage /> },

  { path: '/inventory/materials', element: <MaterialsPage /> },
  { path: '/inventory/materials/:sku', element: <MaterialDetailPage /> },
  { path: '/inventory/purchase-orders', element: <PurchaseOrdersPage /> },
  { path: '/inventory/purchase-orders/:id', element: <PurchaseOrderDetailPage /> },
  { path: '/inventory/bom-templates', element: <BomTemplatesPage /> },
  { path: '/inventory/suppliers', element: <SuppliersPage /> },
  { path: '/inventory/stock-movements', element: <StockMovementsPage /> },
  { path: '/inventory/reports', element: <InventoryReportsPage /> },

  { path: '/pos/terminal', element: <PosTerminalPage /> },
  { path: '/pos/sales-history', element: <PosSalesHistoryPage /> },

  { path: '/finance/invoices', element: <InvoicesPage /> },
  { path: '/finance/invoices/:id', element: <InvoiceDetailPage /> },
  { path: '/finance/payments', element: <PaymentsPage /> },
  { path: '/finance/accounts', element: <AccountsPage /> },
  { path: '/finance/journals', element: <JournalEntriesPage /> },
  { path: '/finance/journals/:id', element: <JournalEntryDetailPage /> },
  { path: '/finance/reports', element: <FinancialReportsPage /> },

  { path: '/marketing/campaigns', element: <CampaignsPage /> },
  { path: '/marketing/campaigns/:id', element: <CampaignDetailPage /> },
  { path: '/marketing/ad-performance', element: <AdPerformancePage /> },

  { path: '/communications/inbox', element: <InboxPage /> },
  { path: '/communications/conversations/:id', element: <ConversationDetailPage /> },

  { path: '/ai/overview', element: <AiOverviewPage /> },

  { path: '/admin/users', element: <UsersPage /> },
  { path: '/admin/users/:id', element: <UserDetailPage /> },
  { path: '/admin/roles', element: <RolesPage /> },
  { path: '/admin/roles/:id', element: <RoleDetailPage /> },
  { path: '/admin/audit-logs', element: <AuditLogsPage /> },
  { path: '/admin/system-settings', element: <SystemSettingsPage /> },
  { path: '/account/change-password', element: <ChangePasswordPage /> },
]