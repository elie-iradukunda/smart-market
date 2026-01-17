-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 17, 2026 at 11:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_market`
--

-- --------------------------------------------------------

--
-- Table structure for table `ads`
--

CREATE TABLE `ads` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `link_url` varchar(500) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT 'Learn More',
  `background_color` varchar(50) DEFAULT '#4F46E5',
  `text_color` varchar(50) DEFAULT '#FFFFFF',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `impressions` int(11) DEFAULT 0,
  `clicks` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ad_performance`
--

CREATE TABLE `ad_performance` (
  `id` int(11) NOT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `impressions` int(11) DEFAULT 0,
  `clicks` int(11) DEFAULT 0,
  `conversions` int(11) DEFAULT 0,
  `cost_spent` decimal(12,2) DEFAULT 0.00,
  `date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_predictions`
--

CREATE TABLE `ai_predictions` (
  `id` int(11) NOT NULL,
  `type` enum('demand','pricing','churn','reorder','segment') DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `predicted_value` decimal(12,2) DEFAULT NULL,
  `confidence` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_predictions`
--

INSERT INTO `ai_predictions` (`id`, `type`, `target_id`, `predicted_value`, `confidence`, `created_at`) VALUES
(7, 'demand', 1, 83.00, 0.80, '2026-01-17 22:02:56'),
(8, 'segment', 2, 8.00, 0.70, '2026-01-17 22:02:56'),
(9, 'churn', 2, 22.42, 0.70, '2026-01-17 22:02:56');

-- --------------------------------------------------------

--
-- Table structure for table `artwork_files`
--

CREATE TABLE `artwork_files` (
  `id` int(11) NOT NULL,
  `quote_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `version` int(11) DEFAULT 1,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `table_name` varchar(120) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `ip_address` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `timestamp`, `ip_address`) VALUES
(1, 1, 'CREATE', 'materials', NULL, '2025-12-21 22:22:02', '::1'),
(2, 1, 'UPDATE', 'materials', NULL, '2025-12-21 22:24:57', '::1'),
(3, 1, 'CREATE', 'material_sales', NULL, '2025-12-21 22:33:16', '::1');

-- --------------------------------------------------------

--
-- Table structure for table `bom`
--

CREATE TABLE `bom` (
  `id` int(11) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `quantity_required` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

CREATE TABLE `campaigns` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `platform` varchar(50) DEFAULT 'email',
  `budget` decimal(12,2) DEFAULT 0.00,
  `sent_count` int(11) DEFAULT 0,
  `failed_count` int(11) DEFAULT 0,
  `status` enum('active','paused','ended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `id` int(11) NOT NULL,
  `account_code` varchar(50) DEFAULT NULL,
  `name` varchar(120) DEFAULT NULL,
  `type` enum('asset','liability','equity','revenue','expense') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `channel` enum('whatsapp','instagram','facebook','web','email','phone') DEFAULT NULL,
  `status` enum('open','closed','pending') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `source` enum('walkin','whatsapp','instagram','facebook','web','phone') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `address`, `source`) VALUES
(2, 'Igihozo Cynthia', NULL, 'igihozo@gmail.com', 'Kigali 250', 'web');

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_orders`
--

CREATE TABLE `ecommerce_orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shipping_address` text DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_zip` varchar(20) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `transaction_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ecommerce_orders`
--

INSERT INTO `ecommerce_orders` (`id`, `customer_id`, `total_amount`, `status`, `shipping_address`, `shipping_city`, `shipping_zip`, `payment_method`, `payment_status`, `transaction_id`, `created_at`) VALUES
(1, 2, 5000.00, 'pending', 'Kigali 250', 'Musanze', '0000', 'mtn', 'paid', '7cff8fc6-a6cd-4438-95fd-dcd48eab60d4', '2026-01-17 21:49:43');

-- --------------------------------------------------------

--
-- Table structure for table `ecommerce_order_items`
--

CREATE TABLE `ecommerce_order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ecommerce_order_items`
--

INSERT INTO `ecommerce_order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 5000.00);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `status` enum('unpaid','partial','paid') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entries`
--

CREATE TABLE `journal_entries` (
  `id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('draft','posted') DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_lines`
--

CREATE TABLE `journal_lines` (
  `id` int(11) NOT NULL,
  `journal_id` int(11) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `debit` decimal(12,2) DEFAULT 0.00,
  `credit` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `channel` enum('whatsapp','instagram','facebook','web') DEFAULT NULL,
  `status` enum('new','contacted','converted','lost') DEFAULT 'new'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_items`
--

CREATE TABLE `lead_items` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `quantity` decimal(12,2) DEFAULT 1.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `reorder_level` int(11) DEFAULT 0,
  `current_stock` decimal(12,2) DEFAULT 0.00,
  `price_per_metre` decimal(12,2) DEFAULT NULL,
  `is_sellable` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `name`, `unit`, `category`, `reorder_level`, `current_stock`, `price_per_metre`, `is_sellable`) VALUES
(1, 'Banner', '1', 'design', -1, -3.00, 1000.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `material_sales`
--

CREATE TABLE `material_sales` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `sold_by` int(11) NOT NULL,
  `metres_sold` decimal(12,2) NOT NULL,
  `price_per_metre` decimal(12,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Records of material sales by metre';

--
-- Dumping data for table `material_sales`
--

INSERT INTO `material_sales` (`id`, `material_id`, `customer_id`, `sold_by`, `metres_sold`, `price_per_metre`, `total_amount`, `notes`, `created_at`) VALUES
(1, 1, NULL, 1, 3.00, 1000.00, 3000.00, NULL, '2025-12-21 20:33:16');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) DEFAULT NULL,
  `sender` enum('customer','staff') DEFAULT NULL,
  `message` text DEFAULT NULL,
  `attachments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `quote_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `status` enum('design','prepress','print','finishing','qa','ready','delivered') DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `deposit_paid` decimal(12,2) DEFAULT 0.00,
  `balance` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `method` varchar(50) DEFAULT 'cash',
  `amount` decimal(12,2) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'completed',
  `gateway` varchar(50) DEFAULT 'cash',
  `gateway_transaction_id` varchar(255) DEFAULT NULL,
  `gateway_response` text DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `code` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `code`, `description`) VALUES
(1, 'user.create', 'Create new users'),
(2, 'user.view', 'View users'),
(3, 'customer.create', 'Create customers'),
(4, 'customer.view', 'View customers'),
(5, 'lead.create', 'Create leads'),
(6, 'quote.create', 'Create quotes'),
(7, 'quote.approve', 'Approve quotes'),
(8, 'order.view', 'View orders'),
(9, 'order.update', 'Update orders'),
(10, 'material.create', 'Create materials'),
(11, 'material.view', 'View materials'),
(12, 'stock.move', 'Record stock movements'),
(13, 'po.create', 'Create purchase orders'),
(14, 'workorder.create', 'Create work orders'),
(15, 'workorder.update', 'Update work orders'),
(16, 'worklog.create', 'Log work time'),
(17, 'invoice.create', 'Create invoices'),
(18, 'payment.create', 'Record payments'),
(19, 'pos.create', 'Create POS sales'),
(20, 'journal.create', 'Create journal entries'),
(21, 'campaign.create', 'Create campaigns'),
(22, 'campaign.view', 'View campaigns'),
(23, 'campaign.update', 'Update campaigns'),
(24, 'conversation.create', 'Create conversations'),
(25, 'conversation.view', 'View conversations'),
(26, 'message.send', 'Send messages'),
(27, 'message.view', 'View messages'),
(28, 'ai.create', 'Create AI predictions'),
(29, 'ai.view', 'View AI insights'),
(30, 'report.view', 'View reports'),
(31, 'file.upload', 'Upload files'),
(32, 'user.manage', 'Create and manage user accounts'),
(33, 'role.manage', 'Create and manage roles and permissions'),
(34, 'audit.view', 'View audit logs'),
(35, 'settings.manage', 'Manage system-wide settings'),
(36, 'customer.manage', 'Create and manage customers'),
(37, 'customer.update', 'Update existing customers'),
(38, 'lead.manage', 'Create and manage leads'),
(39, 'lead.view', 'View leads'),
(40, 'quote.manage', 'Create and manage quotes and quote items'),
(41, 'quote.view', 'View quotes'),
(42, 'order.create', 'Create new orders'),
(43, 'workorder.view', 'View work orders'),
(44, 'inventory.manage', 'Manage materials, suppliers, and purchase orders'),
(45, 'supplier.view', 'View suppliers'),
(46, 'po.view', 'View purchase orders'),
(47, 'po.approve', 'Approve purchase orders'),
(48, 'invoice.view', 'View invoices'),
(49, 'invoice.send', 'Send invoices to customers'),
(50, 'payment.view', 'View payments'),
(51, 'payment.refund', 'Process payment refunds'),
(52, 'pos.view', 'View POS sales history'),
(53, 'campaign.manage', 'Manage marketing campaigns'),
(54, 'campaign.launch', 'Launch marketing campaigns'),
(55, 'ad.create', 'Create ads'),
(56, 'ad.view', 'View ads'),
(57, 'ad.edit', 'Edit ads'),
(58, 'ad.delete', 'Delete ads'),
(59, 'message.create', 'Create/send messages'),
(60, 'file.view', 'View uploaded files'),
(61, 'material.sell', 'Record material sales'),
(62, 'material.manage', 'Manage material settings including pricing');

-- --------------------------------------------------------

--
-- Table structure for table `pos_items`
--

CREATE TABLE `pos_items` (
  `id` int(11) NOT NULL,
  `pos_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pos_sales`
--

CREATE TABLE `pos_sales` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `cashier_id` int(11) DEFAULT NULL,
  `total` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `image`, `category`, `stock_quantity`, `created_at`) VALUES
(1, 'Stamp', 'Official rubber stamp suitable for office, school, and business use. Durable handle with clear imprint, ideal for documents, approvals, and branding purposes. Long-lasting ink and easy to use.', 5000.00, '/uploads/products/product-1768686250175-102390648.jpeg', '', 12, '2026-01-17 21:44:14');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `order_date` date DEFAULT curdate(),
  `expected_delivery` date DEFAULT NULL,
  `delivery_address` text DEFAULT NULL,
  `payment_terms` varchar(50) DEFAULT 'net_30',
  `notes` text DEFAULT NULL,
  `total` decimal(12,2) DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT 0.00,
  `tax` decimal(12,2) DEFAULT 0.00,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved','sent','received') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL,
  `purchase_order_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT NULL,
  `unit_price` decimal(12,2) DEFAULT NULL,
  `total` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotes`
--

CREATE TABLE `quotes` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quote_items`
--

CREATE TABLE `quote_items` (
  `id` int(11) NOT NULL,
  `quote_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `unit_price` decimal(12,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `total` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'owner', 'System owner with complete access and all privileges'),
(2, 'Designer', 'the one who designs and sells designs'),
(3, 'accountant', 'Finance and accounting'),
(4, 'controller', 'Operations controller'),
(5, 'reception', 'Front desk and customer service'),
(6, 'technician', 'Production technician'),
(7, 'production_manager', 'Production manager'),
(8, 'inventory_manager', 'Inventory and purchasing'),
(9, 'sales_rep', 'Sales representative'),
(10, 'marketing_manager', 'Marketing team'),
(11, 'pos_cashier', 'Point of sale operator'),
(12, 'support_agent', 'Customer support'),
(13, 'customer', 'E-commerce customer');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 62),
(2, 1),
(2, 2),
(2, 3),
(2, 28),
(2, 29),
(2, 32),
(2, 36),
(2, 55),
(2, 56),
(2, 57),
(2, 58),
(2, 62),
(3, 4),
(3, 8),
(3, 17),
(3, 18),
(3, 19),
(3, 20),
(3, 30),
(3, 45),
(3, 48),
(3, 49),
(3, 50),
(3, 51),
(3, 52),
(4, 4),
(4, 8),
(4, 9),
(4, 10),
(4, 11),
(4, 29),
(4, 30),
(4, 43),
(4, 44),
(4, 45),
(5, 3),
(5, 4),
(5, 5),
(5, 6),
(5, 7),
(5, 8),
(5, 11),
(5, 19),
(5, 31),
(5, 36),
(5, 38),
(5, 39),
(5, 40),
(5, 41),
(5, 42),
(5, 48),
(5, 50),
(5, 52),
(5, 60),
(5, 61),
(6, 8),
(6, 9),
(6, 11),
(6, 15),
(6, 16),
(6, 43),
(6, 60),
(7, 4),
(7, 8),
(7, 9),
(7, 10),
(7, 11),
(7, 14),
(7, 15),
(7, 16),
(7, 30),
(7, 43),
(7, 44),
(7, 45),
(7, 60),
(8, 8),
(8, 10),
(8, 11),
(8, 12),
(8, 13),
(8, 30),
(8, 44),
(8, 45),
(8, 46),
(8, 47),
(8, 62),
(9, 3),
(9, 4),
(9, 5),
(9, 6),
(9, 7),
(9, 8),
(9, 19),
(9, 30),
(9, 31),
(9, 36),
(9, 38),
(9, 39),
(9, 40),
(9, 41),
(9, 42),
(9, 48),
(9, 50),
(9, 52),
(9, 60),
(9, 61),
(10, 4),
(10, 21),
(10, 22),
(10, 23),
(10, 29),
(10, 30),
(10, 38),
(10, 39),
(10, 53),
(10, 55),
(10, 56),
(10, 57),
(10, 58),
(11, 3),
(11, 4),
(11, 5),
(11, 6),
(11, 11),
(11, 17),
(11, 18),
(11, 19),
(11, 48),
(11, 50),
(11, 52),
(11, 61),
(12, 4),
(12, 8),
(12, 24),
(12, 25),
(12, 26),
(12, 31),
(12, 36),
(12, 60);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `type` enum('grn','issue','return','adjustment','damage') DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `material_id`, `type`, `quantity`, `reference`, `user_id`, `created_at`) VALUES
(1, 1, 'issue', 3.00, 'SALE-1', 1, '2025-12-21 20:33:16');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `contact` varchar(120) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Rwanda',
  `tax_id` varchar(50) DEFAULT NULL,
  `payment_terms` varchar(50) DEFAULT 'net_30',
  `bank_name` varchar(120) DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rating` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `status` enum('active','disabled') DEFAULT 'active',
  `is_super_admin` tinyint(1) DEFAULT 0 COMMENT 'Super admin flag for users with all privileges'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role_id`, `status`, `is_super_admin`) VALUES
(1, 'System Administrator', 'admin@topdesign.com', '+250788000001', '$2a$10$Ar25x/G4f5aZEgW1fWW.0eZ1.j0I8DHlnJrcaUGFIoEDAjdSufLdO', 1, 'active', 1),
(2, 'Operations Admin', 'ops.admin@topdesign.com', '+250788000002', '$2a$10$/QsypC7EyvYqGUhUMSjuiOid0IsheeZp5FruiMOCSaG9LYlJyLnGu', 1, 'active', 1),
(3, 'IT Administrator', 'it.admin@topdesign.com', '+250788000003', '$2a$10$/QsypC7EyvYqGUhUMSjuiOid0IsheeZp5FruiMOCSaG9LYlJyLnGu', 1, 'active', 1),
(4, 'Hozana DUSABIMANA', 'dhozana559@gmail.com', '0791724884', '$2a$10$z5vr2ym2L8Zt3/CTpycOX.cCshjdC1vjTzXAwtXmm2fPbORG5xc46', 2, 'disabled', 0),
(7, 'Hozana DUSABIMANA', 'hozanadusabimana@gmail.com', '0791724824', '$2a$10$SeRN6iSmhHxYJYPoWhd2seorqKhuYcGaEH9.I2bUWoPYmbfsTzS.m', 2, 'active', 0),
(21, 'Hozansa DUSABIMANA', 'dho@gmail.com', '0791724833', '$2a$10$oZ/RuwxtFjCltAuonkEoJevBX34CZbISdgJo6Lb9lJI.qmGvMA2aG', 13, 'active', 0),
(23, 'Hozana DUSABIMANA', 'customer@gmail.com', '0791724883', '$2a$10$Ar25x/G4f5aZEgW1fWW.0eZ1.j0I8DHlnJrcaUGFIoEDAjdSufLdO', 13, 'active', 0),
(24, 'Igihozo Cynthia', 'igihozo@gmail.com', '+250785419324', '$2a$10$.vfTFDOhCCmS0JmmJXlP1uI4I8.RGYIltR4oyo/3GuvFLkfoEdQli', 13, 'active', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `granted_by` int(11) DEFAULT NULL COMMENT 'User ID who granted this permission',
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'Optional expiration date for temporary permissions'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_logs`
--

CREATE TABLE `work_logs` (
  `id` int(11) NOT NULL,
  `work_order_id` int(11) DEFAULT NULL,
  `technician_id` int(11) DEFAULT NULL,
  `time_spent_minutes` int(11) DEFAULT NULL,
  `material_used` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_orders`
--

CREATE TABLE `work_orders` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `stage` enum('design','prepress','print','finishing','qa') DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','in_progress','completed','on_hold') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ads`
--
ALTER TABLE `ads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_ads_active` (`is_active`,`start_date`,`end_date`,`display_order`);

--
-- Indexes for table `ad_performance`
--
ALTER TABLE `ad_performance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaign_id` (`campaign_id`);

--
-- Indexes for table `ai_predictions`
--
ALTER TABLE `ai_predictions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `artwork_files`
--
ALTER TABLE `artwork_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_id` (`quote_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `bom`
--
ALTER TABLE `bom`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `ecommerce_orders`
--
ALTER TABLE `ecommerce_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `ecommerce_order_items`
--
ALTER TABLE `ecommerce_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `journal_lines`
--
ALTER TABLE `journal_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `journal_id` (`journal_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `lead_items`
--
ALTER TABLE `lead_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_id` (`lead_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `material_sales`
--
ALTER TABLE `material_sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_sold_by` (`sold_by`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_id` (`quote_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `pos_items`
--
ALTER TABLE `pos_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pos_id` (`pos_id`);

--
-- Indexes for table `pos_sales`
--
ALTER TABLE `pos_sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `cashier_id` (`cashier_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`category`),
  ADD KEY `idx_products_created_at` (`created_at`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_number` (`reference_number`),
  ADD KEY `idx_po_reference` (`reference_number`),
  ADD KEY `idx_po_supplier` (`supplier_id`),
  ADD KEY `idx_po_status` (`status`),
  ADD KEY `idx_po_created_by` (`created_by`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `quotes`
--
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `quote_items`
--
ALTER TABLE `quote_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_id` (`quote_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_supplier_name` (`name`),
  ADD KEY `idx_supplier_email` (`email`),
  ADD KEY `idx_supplier_phone` (`phone`),
  ADD KEY `idx_supplier_active` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_permission` (`user_id`,`permission_id`),
  ADD KEY `granted_by` (`granted_by`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_permission_id` (`permission_id`);

--
-- Indexes for table `work_logs`
--
ALTER TABLE `work_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `work_order_id` (`work_order_id`),
  ADD KEY `technician_id` (`technician_id`);

--
-- Indexes for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ads`
--
ALTER TABLE `ads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ad_performance`
--
ALTER TABLE `ad_performance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_predictions`
--
ALTER TABLE `ai_predictions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `artwork_files`
--
ALTER TABLE `artwork_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bom`
--
ALTER TABLE `bom`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ecommerce_orders`
--
ALTER TABLE `ecommerce_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ecommerce_order_items`
--
ALTER TABLE `ecommerce_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journal_entries`
--
ALTER TABLE `journal_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journal_lines`
--
ALTER TABLE `journal_lines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_items`
--
ALTER TABLE `lead_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `material_sales`
--
ALTER TABLE `material_sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `pos_items`
--
ALTER TABLE `pos_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pos_sales`
--
ALTER TABLE `pos_sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotes`
--
ALTER TABLE `quotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quote_items`
--
ALTER TABLE `quote_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `work_logs`
--
ALTER TABLE `work_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `work_orders`
--
ALTER TABLE `work_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ads`
--
ALTER TABLE `ads`
  ADD CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `ad_performance`
--
ALTER TABLE `ad_performance`
  ADD CONSTRAINT `ad_performance_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`);

--
-- Constraints for table `artwork_files`
--
ALTER TABLE `artwork_files`
  ADD CONSTRAINT `artwork_files_ibfk_1` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`),
  ADD CONSTRAINT `artwork_files_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `quotes` (`id`);

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `bom`
--
ALTER TABLE `bom`
  ADD CONSTRAINT `bom_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`);

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `ecommerce_orders`
--
ALTER TABLE `ecommerce_orders`
  ADD CONSTRAINT `ecommerce_orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `ecommerce_order_items`
--
ALTER TABLE `ecommerce_order_items`
  ADD CONSTRAINT `ecommerce_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`),
  ADD CONSTRAINT `ecommerce_order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `journal_lines`
--
ALTER TABLE `journal_lines`
  ADD CONSTRAINT `journal_lines_ibfk_1` FOREIGN KEY (`journal_id`) REFERENCES `journal_entries` (`id`),
  ADD CONSTRAINT `journal_lines_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`);

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `leads_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `lead_items`
--
ALTER TABLE `lead_items`
  ADD CONSTRAINT `lead_items_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lead_items_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`);

--
-- Constraints for table `material_sales`
--
ALTER TABLE `material_sales`
  ADD CONSTRAINT `material_sales_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  ADD CONSTRAINT `material_sales_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `material_sales_ibfk_3` FOREIGN KEY (`sold_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `pos_items`
--
ALTER TABLE `pos_items`
  ADD CONSTRAINT `pos_items_ibfk_1` FOREIGN KEY (`pos_id`) REFERENCES `pos_sales` (`id`);

--
-- Constraints for table `pos_sales`
--
ALTER TABLE `pos_sales`
  ADD CONSTRAINT `pos_sales_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `pos_sales_ibfk_2` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`),
  ADD CONSTRAINT `purchase_order_items_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`);

--
-- Constraints for table `quotes`
--
ALTER TABLE `quotes`
  ADD CONSTRAINT `quotes_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `quotes_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `quotes_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `quote_items`
--
ALTER TABLE `quote_items`
  ADD CONSTRAINT `quote_items_ibfk_1` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`),
  ADD CONSTRAINT `quote_items_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`);

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`);

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permissions_ibfk_3` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `work_logs`
--
ALTER TABLE `work_logs`
  ADD CONSTRAINT `work_logs_ibfk_1` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`),
  ADD CONSTRAINT `work_logs_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD CONSTRAINT `work_orders_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `work_orders_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
