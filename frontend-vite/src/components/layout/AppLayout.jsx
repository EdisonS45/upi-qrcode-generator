import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-brand-gray">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        <Outlet /> {/* This is where nested routes will render */}
      </main>
    </div>
  );
}