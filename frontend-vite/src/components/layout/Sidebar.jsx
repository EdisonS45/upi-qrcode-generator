import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, Settings, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Logo = () => (
  <div className="flex items-center mb-8">
    <Package className="w-8 h-8 text-primary" />
    <span className="ml-2 text-xl font-bold text-brand-dark">PayGen</span>
  </div>
);

const NavItem = ({ to, icon, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-brand-text hover:bg-secondary'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
};

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-64 bg-white border-r border-border p-6 flex flex-col shrink-0">
      <Logo />
      <ul className="space-y-2">
        <NavItem to="/dashboard" icon={<Home className="w-5 h-5 mr-3" />}>
          Home
        </NavItem>
        <NavItem to="/invoices" icon={<FileText className="w-5 h-5 mr-3" />}>
          Invoices
        </NavItem>
        <NavItem to="/settings" icon={<Settings className="w-5 h-5 mr-3" />}>
          Settings
        </NavItem>
      </ul>
      <div className="mt-auto">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="nav-link flex items-center justify-start w-full px-4 py-3 font-medium text-brand-text hover:bg-secondary"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </nav>
  );
}