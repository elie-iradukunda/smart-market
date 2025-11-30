# TOP Design - E-Commerce Frontend

A modern, full-featured e-commerce web application built with **React**, **TypeScript**, and **Tailwind CSS**, tailored for a design agency.

## 🚀 Features

### ✅ Complete E-Commerce Functionality

1. **Homepage**
   - Modern hero section with animated gradients and blob effects
   - Featured design services grid
   - Features showcase (Creative Excellence, Fast Delivery, 24/7 Support)
   - Call-to-action sections

2. **Service Listing**
   - Responsive service grid (1-4 columns based on screen size)
   - Search functionality
   - Category filtering
   - Service cards with:
     - High-quality images
     - Category badges
     - Hover effects
     - "Add to Cart" buttons

3. **Shopping Cart**
   - View all cart items
   - Increase/decrease quantity
   - Remove items
   - Real-time total calculation in **Rwandan Francs (RF)**
   - **LocalStorage persistence** (cart survives page refresh)
   - Empty cart state with call-to-action

4. **User Authentication**
   - **Registration** with:
     - Full name
     - Email
     - Phone number
     - Password confirmation
   - **Login** with email/password
   - User data stored in localStorage
   - Session management with sessionStorage
   - Protected routes for authenticated users

5. **Checkout Process**
   - Customer information (auto-filled from auth)
   - Shipping address form
   - Order summary with RF pricing
   - Payment method (Cash on Delivery)
   - Order placement

6. **Order Management**
   - **Order Tracking Page**
     - Search by Order ID
     - Visual status progress bar
     - Order details display
     - Customer information
     - Items list with images
   - **My Orders Page**
     - View all user orders
     - Order status badges
     - Quick view links
     - Order history

7. **UI/UX Features**
   - Modern, clean design
   - Fully responsive (mobile, tablet, desktop)
   - Smooth animations (fade-in, blob, gradient text)
   - Toast notifications for user actions
   - Loading states
   - Empty states
   - Error handling

## 📁 File Structure

```
frontend/src/
├── components/
│   ├── ecommerce/
│   │   ├── ProductCard.tsx          # Reusable service card component
│   │   └── EcommerceNavbar.tsx      # Navigation with cart counter
│   └── layout/
│       └── EcommerceLayout.tsx      # Layout wrapper with nav & footer
├── contexts/
│   ├── CartContext.tsx              # Cart state management
│   └── AuthContext.tsx              # Authentication state management
├── data/
│   └── products.ts                  # Mock service data & API
├── pages/
│   ├── HomePage.tsx                 # Agency homepage
│   └── Shop/
│       ├── ProductsPage.tsx         # Service listing page
│       ├── CartPage.tsx             # Shopping cart page
│       ├── ShopLoginPage.tsx        # Login page
│       ├── ShopRegisterPage.tsx     # Registration page
│       ├── CheckoutPage.tsx         # Checkout & order placement
│       ├── OrderTrackingPage.tsx    # Track order by ID
│       └── MyOrdersPage.tsx         # User's order history
└── App.tsx                          # Main app with routes & providers
```

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Toastify** - Toast notifications
- **LocalStorage** - Data persistence

## 🎨 Design Highlights

- **Modern Service Cards** with hover effects
- **Animated Gradient Backgrounds** for visual appeal
- **Responsive grid layouts** (1-4 columns)
- **Modern color palette** (Blue primary, with accent colors)
- **Smooth transitions** and micro-animations
- **Premium UI** with shadows, rounded corners, and glassmorphism

## 🔄 Data Flow

### Cart Management
```
User Action → CartContext → LocalStorage → UI Update
```

### Authentication
```
Register/Login → AuthContext → LocalStorage/SessionStorage → Protected Routes
```

### Order Placement
```
Checkout → Create Order Object → LocalStorage → Order Tracking
```

## 📦 LocalStorage Structure

### Cart Data
```json
{
  "cart": [
    {
      "id": "1",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2,
      "image": "url",
      "description": "...",
      "category": "Electronics"
    }
  ]
}
```

### User Data
```json
{
  "users": [
    {
      "id": "1234567890",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "password": "hashed_password"
    }
  ]
}
```

### Orders Data
```json
{
  "orders": [
    {
      "orderId": "ORD-1234567890",
      "customerDetails": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567890",
        "address": "123 Main St",
        "city": "New York",
        "zipCode": "10001"
      },
      "items": [...],
      "total": 299.99,
      "status": "Pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🚦 Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Homepage with featured products | No |
| `/products` | All products with search & filter | No |
| `/cart` | Shopping cart | No |
| `/shop/login` | User login | No |
| `/shop/register` | User registration | No |
| `/checkout` | Checkout & order placement | **Yes** |
| `/orders` | User's order history | **Yes** |
| `/order-tracking` | Track order by ID | No |

## 🎯 Key Components

### ProductCard
- Displays product information
- Add to cart functionality
- Hover effects and animations
- Category badge
- Responsive design

### EcommerceNavbar
- Logo and branding
- Navigation links (Home, Products)
- Cart icon with item counter
- User menu (Login/Register or User Profile)
- Responsive mobile menu

### CartContext
- Global cart state
- Add/remove/update items
- Calculate totals
- LocalStorage sync

### AuthContext
- User authentication
- Registration & login
- Session management
- Protected route logic

## 🔐 Security Notes

⚠️ **Important**: This is a frontend-only implementation for demonstration purposes.

In production, you should:
- Use a backend API for authentication
- Hash passwords on the server
- Use JWT or session tokens
- Validate all inputs server-side
- Use HTTPS
- Implement CSRF protection
- Add rate limiting

## 🎨 Customization

### Colors
The app uses a blue color scheme. To change:
- Update Tailwind classes in components
- Modify gradient colors in hero sections

### Products
Edit `src/data/products.ts` to add/modify products:
```typescript
{
  id: 'unique-id',
  name: 'Product Name',
  description: 'Product description',
  price: 99.99,
  image: 'image-url',
  category: 'Category'
}
```

### Order Statuses
Available statuses: `Pending`, `Processing`, `Shipped`, `Delivered`

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🎉 Features Checklist

- ✅ Homepage with product grid
- ✅ Product listing with search & filters
- ✅ Add to cart functionality
- ✅ Cart with quantity controls
- ✅ LocalStorage cart persistence
- ✅ User registration
- ✅ User login
- ✅ Protected routes
- ✅ Checkout process
- ✅ Order placement
- ✅ Order tracking
- ✅ Order history
- ✅ Responsive design
- ✅ Modern UI/UX
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty states

## 📝 Future Enhancements

- Backend API integration
- Real payment gateway
- Product reviews & ratings
- Wishlist functionality
- Advanced search & filters
- Product recommendations
- Email notifications
- Admin dashboard
- Inventory management
- Analytics & reporting

---

Built with ❤️ using React + TypeScript + Tailwind CSS
