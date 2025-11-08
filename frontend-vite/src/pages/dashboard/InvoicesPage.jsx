import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import InvoiceTable from './components/InvoiceTable'; // Re-using the component

// The fetcher function for React Query
const fetchInvoices = async () => {
  const { data } = await api.get('/invoices');
  return data.data; // Our API returns data inside a 'data' property
};

export default function InvoicesPage() {
  const navigate = useNavigate();

  // Use useQuery to fetch data
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'], // This key matches the one in DashboardPage
    queryFn: fetchInvoices,
  });

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-brand-dark">Invoices</h1>
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="w-5 h-5 mr-2" />
          New Invoice
        </Button>
      </header>
      
      <Card>
        <CardContent className="p-0"> {/* Remove padding to let table fit edge-to-edge */}
          {isLoading ? (
            <div className="p-10 flex justify-center"><Spinner size="lg" /></div>
          ) : error ? (
            <p className="p-10 text-center text-red-500">Failed to load invoices.</p>
          ) : invoices.length === 0 ? (
            <p className="p-10 text-center text-brand-text">You haven't created any invoices yet.</p>
          ) : (
            <InvoiceTable invoices={invoices} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}