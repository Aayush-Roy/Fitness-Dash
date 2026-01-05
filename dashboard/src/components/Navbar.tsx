import { Bell, Search } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-300"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 hover:bg-dark-800 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-purple rounded-full"></div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-300">Admin User</span>
                <span className="px-2 py-1 text-xs font-bold bg-primary-900 text-primary-300 rounded-full">
                  ADMIN
                </span>
              </div>
              {/* <p className="text-sm text-gray-500">gymadmin@example.com</p> */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;