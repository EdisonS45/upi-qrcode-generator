import React, { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { indianStates } from '@/lib/states';
import { PDFViewer } from '@react-pdf/renderer';
import { InvoiceTemplate } from '@/components/invoice/InvoiceTemplate';
import { amountToWords } from '@/lib/amountToWords';
import { useDebounce } from '@/hooks/useDebounce'; // We'll add this hook
import { useImageAsDataURL } from '@/hooks/useImageAsDataURL'; // We'll add this hook
import { Spinner } from '@/components/ui/spinner';

// 1. Define the new, comprehensive validation schema
const itemSchema = z.object({
  description: z.string().min(1, 'Desc required'),
  hsnSacCode: z.string().optional(),
  qty: z.coerce.number().min(0.01, 'Qty > 0'),
  rate: z.coerce.number().gte(0),
  amount: z.coerce.number(), // This will be calculated
});

const invoiceSchema = z.object({
  // Client
  clientName: z.string().min(1, 'Client name is required'),
  clientGst: z.string().length(15, "Invalid GSTIN").optional().or(z.literal("")),
  clientPan: z.string().length(10, "Invalid PAN").optional().or(z.literal("")),
  clientAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().min(1, "Client state is required"),
    pincode: z.string().length(6, "Invalid pincode").optional().or(z.literal("")),
    country: z.string().default('India'),
  }),
  
  // Metadata
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  placeOfSupply: z.string().min(1, "Place of Supply is required"),
  countryOfSupply: z.string().default('India'),

  // Items
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  
  // Totals
  discountType: z.enum(['fixed', 'percentage']).default('fixed'),
  discountValue: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).default(18),
  earlyPayDiscount: z.coerce.number().min(0).default(0),
  
  // Notes
  termsAndConditions: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// Fetcher for the mutation
const createInvoice = async (invoiceData) => {
  const { data } = await api.post('/invoices', invoiceData);
  return data.data;
};

// Helper for required labels
const RequiredLabel = ({ children }) => (
  <Label>{children} <span className="text-red-500">*</span></Label>
);

// Main Component
export default function NewInvoicePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [liveQrCode, setLiveQrCode] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 2. Setup react-hook-form
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(invoiceSchema),
  });

  // Pre-fill form with user defaults
  useEffect(() => {
    if (user) {
      setValue('termsAndConditions', user.termsAndConditions || '');
      setValue('additionalNotes', user.additionalNotes || '');
      // Set default dates
      setValue('invoiceDate', new Date());
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15); // Default 15 days
      setValue('dueDate', dueDate);
    }
  }, [user, setValue]);

  // 3. Setup useFieldArray for dynamic line items
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // 4. Watch all form data for live preview and calculations
  const formData = watch();
  
  // 5. Memoized Live Calculations
  const calculatedTotals = useMemo(() => {
    try {
      const sellerState = user?.address?.state?.toLowerCase().trim() || '';
      const supplyState = formData.placeOfSupply?.toLowerCase().trim() || '';
      const isIntraState = sellerState && supplyState ? sellerState === supplyState : false;

      let subtotal = 0;
      formData.items?.forEach((item, index) => {
        const qty = parseFloat(item.qty) || 0;
        const rate = parseFloat(item.rate) || 0;
        const amount = qty * rate;
        // Set value silently without re-triggering a watch update
        setValue(`items.${index}.amount`, amount, { shouldValidate: false, shouldDirty: false });
        subtotal += amount;
      });

      const discountValue = parseFloat(formData.discountValue) || 0;
      let discountAmount = 0;
      if (formData.discountType === 'percentage') {
        discountAmount = subtotal * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }

      const taxableAmount = subtotal - discountAmount;
      const taxRate = parseFloat(formData.taxRate) || 0;
      const totalTax = taxableAmount * (taxRate / 100);
      
      let cgst = 0, sgst = 0, igst = 0;
      if (isIntraState) {
        cgst = totalTax / 2;
        sgst = totalTax / 2;
      } else {
        igst = totalTax;
      }

      const total = taxableAmount + totalTax;
      const earlyPayDiscount = parseFloat(formData.earlyPayDiscount) || 0;
      const totalDue = total - earlyPayDiscount;
      const words = amountToWords(totalDue);
      
      return { 
        subtotal, discountAmount, taxableAmount, 
        cgst, sgst, igst, totalTax,
        total, earlyPayDiscount, totalDue, 
        amountInWords: words 
      };
    } catch (error) {
      console.error("Error during calculation:", error);
      return { subtotal: 0, discountAmount: 0, taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, total: 0, earlyPayDiscount: 0, totalDue: 0, amountInWords: 'Error' };
    }
  }, [formData.items, formData.discountType, formData.discountValue, formData.taxRate, formData.earlyPayDiscount, formData.placeOfSupply, user?.address?.state, setValue]);
  
  // Combine form data + calculations for the preview
  const liveInvoiceData = { ...formData, ...calculatedTotals };

  // --- Live QR Code Generation ---
  const debouncedTotalDue = useDebounce(calculatedTotals.totalDue, 500);
  useEffect(() => {
    const generateQR = async () => {
      // Lazy load the qr service only on client
      const { generateUpiQRCode } = await import('@/services/qr.service'); 
      if (user?.upiId && debouncedTotalDue > 0 && generateUpiQRCode) {
        try {
          const qr = await generateUpiQRCode({
            upiId: user.upiId,
            name: user.businessName || user.name,
            amount: debouncedTotalDue,
            invoiceNumber: 'DRAFT' // Backend will assign final number
          });
          setLiveQrCode(qr);
        } catch (e) {
          console.error("Failed to generate live QR", e);
        }
      } else {
        setLiveQrCode(null);
      }
    };
    generateQR();
  }, [debouncedTotalDue, user?.upiId, user?.businessName, user?.name]);
  
  // --- Pre-fetch images for PDF ---
  const logoDataURL = useImageAsDataURL(user?.logoUrl);
  const signatureDataURL = useImageAsDataURL(user?.authorizedSignatureUrl);
  
  // 6. Setup mutation
  const mutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      toast.success(`Invoice ${data.invoiceNumber} created!`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
    onError: (error) => {
      // This will now parse the backend validation errors
      const messages = error.response?.data?.errors?.map(e => Object.values(e)[0]) || [error.response?.data?.message];
      toast.error(messages.join('\n') || 'Failed to create invoice');
    },
  });

  // 7. Handle form submission
  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  
  // Helper to format date for input[type=date]
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* --- FIX 1: Add onSubmit to the form tag --- */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow">
        <nav className="flex justify-between items-center py-4 px-6 border-b bg-white">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-brand-dark">Create New Invoice</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-purple-600 hover:bg-purple-700">
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Invoice
            </Button>
          </div>
        </nav>

        {/* Main Content (Editor + Preview) */}
        <div className="flex flex-1 h-[calc(100vh-8rem)]">
          {/* Editor Column */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 bg-gray-50">

            {/* Client Details */}
            <Card className="bg-white">
              <CardContent className="p-6 space-y-4">
                <Label className="text-base font-semibold">Bill To:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <RequiredLabel>Client Name</RequiredLabel>
                    <Input placeholder="Client Name / Company Name" {...register('clientName')} />
                    {errors.clientName && <p className="text-xs text-red-500">{errors.clientName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Client GSTIN</Label>
                    <Input placeholder="Client GSTIN (Optional)" {...register('clientGst')} />
                    {errors.clientGst && <p className="text-xs text-red-500">{errors.clientGst.message}</p>}
                  </div>
                </div>
                
                <Label className="text-sm pt-2">Client Address:</Label>
                <Input placeholder="Street Address (Optional)" {...register('clientAddress.street')} />
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="City (Optional)" {...register('clientAddress.city')} />
                  <div className="space-y-1">
                    <RequiredLabel>State</RequiredLabel>
                    <Controller
                      name="clientAddress.state"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="State*" /></SelectTrigger>
                          <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    />
                    {errors.clientAddress?.state && <p className="text-xs text-red-500">{errors.clientAddress.state.message}</p>}
                  </div>
                  <Input placeholder="Pincode (Optional)" {...register('clientAddress.pincode')} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Client PAN (Optional)" {...register('clientPan')} />
                  <Input placeholder="Client Email (Optional)" {...register('clientEmail')} />
                </div>

              </CardContent>
            </Card>

            {/* Invoice Metadata */}
            <Card className="bg-white">
              <CardContent className="p-6 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <RequiredLabel>Invoice Date</RequiredLabel>
                  <Controller
                    name="invoiceDate"
                    control={control}
                    render={({ field }) => (
                      <Input type="date" value={formatDate(field.value)} onChange={field.onChange} />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date (Optional)</Label>
                   <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Input type="date" value={formatDate(field.value)} onChange={field.onChange} />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel>Place of Supply</RequiredLabel>
                   <Controller
                    name="placeOfSupply"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select Place of Supply*" /></SelectTrigger>
                        <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                  />
                  {errors.placeOfSupply && <p className="text-xs text-red-500">{errors.placeOfSupply.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Country of Supply</Label>
                   <Input {...register('countryOfSupply')} defaultValue="India" />
                </div>
              </CardContent>
            </Card>
            
            {/* Line Items */}
            <Card className="bg-white">
              <CardContent className="p-6 space-y-4">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="col-span-4">Item/Description*</div>
                  <div className="col-span-2">HSN/SAC</div>
                  <div className="col-span-1">Qty*</div>
                  <div className="col-span-2">Rate*</div>
                  <div className="col-span-3">Amount</div>
                </div>
                {/* Items */}
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                    <Textarea className="col-span-4" placeholder="Item Description" {...register(`items.${index}.description`)} rows={1} />
                    <Input className="col-span-2" placeholder="HSN" {...register(`items.${index}.hsnSacCode`)} />
                    <Input className="col-span-1" type="number" step="1" placeholder="1" {...register(`items.${index}.qty`)} />
                    <Input className="col-span-2" type="number" step="0.01" placeholder="0.00" {...register(`items.${index}.rate`)} />
                    <div className="col-span-3 flex items-center">
                      {/* --- FIX 2: Live calculation using watch() --- */}
                      <span className="font-medium text-sm pt-2 pl-2">
                        {formatCurrency((parseFloat(watch(`items.${index}.qty`)) || 0) * (parseFloat(watch(`items.${index}.rate`)) || 0))}
                      </span>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 ml-auto" onClick={() => remove(index)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                 <Button
                  type="button"
                  variant="secondary"
                  onClick={() => append({ description: '', hsnSacCode: '', qty: 1, rate: 0, amount: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Totals & Notes */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column: Discount/Tax/Notes */}
              <div className="space-y-6">
                <Card className="bg-white">
                  <CardContent className="p-6 space-y-4">
                    <Label className="text-base font-semibold">Discount & Tax (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Controller
                        name="discountType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Discount (₹)</SelectItem>
                              <SelectItem value="percentage">Discount (%)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Input type="number" step="0.01" {...register('discountValue')} className="flex-1" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Global Tax Rate (%)</Label>
                      <Input type="number" step="0.01" {...register('taxRate')} placeholder="18" />
                    </div>
                    
                     <div className="space-y-2">
                      <Label>EarlyPay Discount (₹)</Label>
                      <Input type="number" step="0.01" {...register('earlyPayDiscount')} placeholder="0.00" />
                    </div>

                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardContent className="p-6 space-y-2">
                    <Label>Terms & Conditions (Optional)</Label>
                    <Textarea {...register('termsAndConditions')} rows={4} />
                    <Label>Additional Notes (Optional)</Label>
                    <Textarea {...register('additionalNotes')} rows={2} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Totals Summary */}
              <Card className="bg-white sticky top-10">
                <CardContent className="p-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(calculatedTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">- {formatCurrency(calculatedTotals.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxable Amount</span>
                    <span className="font-medium">{formatCurrency(calculatedTotals.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({formData.taxRate || 0}%)</span>
                    <span className="font-medium">+ {formatCurrency(calculatedTotals.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(calculatedTotals.total)}</span>
                  </div>
                  {calculatedTotals.earlyPayDiscount > 0 && (
                     <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">EarlyPay Discount</span>
                      <span className="font-medium text-green-600">- {formatCurrency(calculatedTotals.earlyPayDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t text-purple-600">
                    <span>Total Due</span>
                    <span>{formatCurrency(calculatedTotals.totalDue)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <span className="font-semibold">In Words:</span> {calculatedTotals.amountInWords}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preview Column */}
          {showPreview && (
            <div className="flex-1 border-l bg-gray-200">
              {isClient ? (
                <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                  <InvoiceTemplate 
                    invoiceData={liveInvoiceData} 
                    sellerData={user}
                    qrCodeDataURL={liveQrCode}
                    logoDataURL={logoDataURL}
                    signatureDataURL={signatureDataURL}
                  />
                </PDFViewer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Spinner size="lg" />
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}