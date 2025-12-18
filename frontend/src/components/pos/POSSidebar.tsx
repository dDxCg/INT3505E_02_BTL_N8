import {
  LayoutDashboard,
  ShoppingCart,
  Table2,
  Calendar,
  Truck,
  CreditCard,
  Users,
  FileText,
  MessageSquare,
  User,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  badge?: string;
}

interface POSSidebarProps {
  currentPage: string;
}

export function POSSidebar({ currentPage }: POSSidebarProps) {
  const navigate = useNavigate();

  const mainMenu: MenuItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/staff' },
    { icon: <ShoppingCart size={20} />, label: 'Pos', path: '/staff/pos' },
    { icon: <Table2 size={20} />, label: 'Table', path: '/staff' },
    { icon: <Calendar size={20} />, label: 'Reservations' },
  ];

  const offeringMenu: MenuItem[] = [
    { icon: <Truck size={20} />, label: 'Delivery Executive' },
    { icon: <CreditCard size={20} />, label: 'Payments', badge: 'New' },
    { icon: <Users size={20} />, label: 'Customer' },
    { icon: <FileText size={20} />, label: 'Invoice' },
  ];

  const backOfficeMenu: MenuItem[] = [
    { icon: <MessageSquare size={20} />, label: 'Testimonial' },
    { icon: <User size={20} />, label: 'User' },
    { icon: <BarChart3 size={20} />, label: 'Reports' },
    { icon: <Settings size={20} />, label: 'Setting' },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const renderMenuItem = (item: MenuItem, isActive: boolean) => (
    <button
      key={item.label}
      onClick={() => handleItemClick(item)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left relative
        ${isActive
          ? 'bg-white text-orange-500 shadow-md font-medium'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <span className={isActive ? 'text-orange-500' : 'text-gray-400'}>{item.icon}</span>
      <span className="text-sm font-medium">{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full font-medium">
          {item.badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-72 bg-gray-50 border-r border-gray-100 flex flex-col h-screen">
      {/* Logo - Top Section */}
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
            <ShoppingCart size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-gray-900"> POS </span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
            <User size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800"> Staff </p>
            <p className="text-xs text-gray-400"> Bill Management </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Main Menu - No header */}
        <div className="flex flex-col gap-2 mb-8">
          {mainMenu.map((item) =>
            renderMenuItem(item, item.label.toLowerCase() === currentPage)
          )}
        </div>

        {/* Offering Section */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Offering
          </p>
          <div className="flex flex-col gap-2">
            {offeringMenu.map((item) => renderMenuItem(item, false))}
          </div>
        </div>

        {/* Back Office Section */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Back Office
          </p>
          <div className="flex flex-col gap-2">
            {backOfficeMenu.map((item) => renderMenuItem(item, false))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 py-5 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 text-left">
          <LogOut size={30} className="text-gray-400" />
          <span className="text-sm font-medium">Login</span>
        </button>
      </div>
    </div>
  );
}
