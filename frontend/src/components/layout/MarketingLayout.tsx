import React from 'react';
import { Link } from 'react-router-dom';
import MarketingTopNav from './MarketingTopNav';
import { HomeIcon, ChartBarIcon, EnvelopeIcon, UserGroupIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard/marketing', icon: HomeIcon, current: true },
    { name: 'Campaigns', href: '/marketing/campaigns', icon: EnvelopeIcon, current: false },
    { name: 'Audience', href: '/marketing/audience', icon: UserGroupIcon, current: false },
    { name: 'Analytics', href: '/marketing/analytics', icon: ChartBarIcon, current: false },
    { name: 'Settings', href: '/marketing/settings', icon: Cog6ToothIcon, current: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/50">
      <MarketingTopNav />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                    Marketing
                  </span>
                </h1>
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      item.current
                        ? 'bg-fuchsia-50 text-fuchsia-700'
                        : 'text-gray-600 hover:bg-fuchsia-50 hover:text-fuchsia-700'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        item.current ? 'text-fuchsia-500' : 'text-gray-400 group-hover:text-fuchsia-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MarketingLayout;
