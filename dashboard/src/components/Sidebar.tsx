import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  Apple, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { SIDEBAR_ITEMS } from '../utils/constants';
import toast from 'react-hot-toast';

const iconMap = {
  LayoutDashboard,
  Users,
  Dumbbell,
  Apple,
  CreditCard,
  Calendar,
  DollarSign,
  User,
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <>
      <div className={`fixed top-0 left-0 h-screen bg-dark-900 border-r border-dark-700 transition-all duration-300 z-40 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-purple rounded-lg"></div>
              <span className="text-xl font-bold text-white">GymMaster Pro</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-all hover:bg-dark-800 hover:shadow-lg ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-900/30 to-dark-800 border-l-4 border-primary-500'
                      : ''
                  }`
                }
              >
                <Icon size={20} className="text-gray-400" />
                {!collapsed && <span className="text-gray-300">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-dark-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors p-3 rounded-lg hover:bg-dark-800 w-full"
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;