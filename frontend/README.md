# TOP Design - Intelligent Business Management System

A modern, AI-augmented business suite for TOP Design (banners, garment branding, and related services). This React frontend provides a professional, responsive interface for managing all aspects of the business operations.

## 🚀 Features

- **Professional Home Page**: Modern landing page with hero section, features overview, modules showcase, and integrations
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type-Safe**: Built with TypeScript for better developer experience
- **Component-Based**: Reusable UI components for scalability
- **Modern Stack**: React 18, Vite, Tailwind CSS, React Router

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern web browser

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout
│   ├── sections/        # Home page sections (Hero, Features, Modules, etc.)
│   └── ui/              # Reusable UI components (Button, Card, etc.)
├── pages/               # Page components
├── utils/               # Utility functions
├── App.tsx              # Main app component with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🎨 Design System

- **Primary Colors**: Blue (#0ea5e9)
- **Secondary Colors**: Purple (#a855f7)
- **Font**: Inter (Google Fonts)
- **UI Framework**: Tailwind CSS with custom configuration

## 📦 Key Modules

The system includes 8 core modules:

1. **CRM & Orders** - Lead management, quotes, file intake
2. **Production/Job Management** - Work orders, Kanban, time tracking
3. **Inventory (Stock)** - BOM management, stock movements, AI reordering
4. **Sales & POS** - Point of sale, barcode scanning, loyalty programs
5. **Finance** - Double-entry accounting, AR/AP, tax management
6. **Marketing** - Campaign management, audience segmentation, ads
7. **Communications** - Unified inbox, SLA management, CSAT tracking
8. **AI & Analytics** - Demand forecasting, dynamic pricing, dashboards

## 🚀 Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🧪 Development

- **Linting**: `npm run lint`
- **Preview Build**: `npm run preview`

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔧 Configuration

- **Vite Config**: `vite.config.ts`
- **Tailwind Config**: `tailwind.config.js`
- **TypeScript Config**: `tsconfig.json`

## 📄 License

Private - TOP Design

## 🤝 Contributing

This is a private project for TOP Design business management system.

---

Built with ❤️ for TOP Design

