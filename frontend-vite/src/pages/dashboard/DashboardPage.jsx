import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import InvoiceTable from './components/InvoiceTable'; // We'll create this next

// The fetcher function for React Query
const fetchInvoices = async () => {
  const { data } = await api.get('/invoices');
  return data.data; // Our API returns data inside a 'data' property
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use useQuery to fetch data
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'], // A unique key for this query
    queryFn: fetchInvoices,
  });

  const recentInvoices = invoices ? invoices.slice(0, 3) : [];
  const pendingInvoices = invoices ? invoices.filter(inv => inv.status === 'Pending').length : 0;
  
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Welcome back, {user?.name}</h1>
        <p className="text-lg text-brand-text mt-1">Here's your financial overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text mb-1">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-dark">₹--</p>
            <p className="text-sm text-brand-text mt-1">Data not available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text mb-1">Invoices Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-dark">{isLoading ? '...' : invoices?.length}</p>
            <p className="text-sm text-brand-text mt-1">In total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text mb-1">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-dark">{isLoading ? '...' : pendingInvoices}</p>
            <p className="text-sm text-brand-text mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brand-dark">Recent Invoices</h2>
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="w-5 h-5 mr-2" />
          New Invoice
        </Button>
      </div>
      
      <Card>
        {isLoading ? (
          <div className="p-10 text-center"><Spinner size="lg" /></div>
        ) : error ? (
          <p className="p-10 text-center text-red-500">Failed to load invoices.</p>
        ) : recentInvoices.length === 0 ? (
          <p className="p-10 text-center text-brand-text">You haven't created any invoices yet.</p>
        ) : (
          <InvoiceTable invoices={recentInvoices} />
        )}
      </Card>
    </div>
  );
}