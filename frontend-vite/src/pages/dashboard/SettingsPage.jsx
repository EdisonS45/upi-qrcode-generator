import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { indianStates } from '@/lib/states';

// 1. Define the new, comprehensive validation schema
const settingsSchema = z.object({
  name: z.string().min(2, "Name is required"),
  businessName: z.string().min(2, "Business name is required"),
  gstin: z.string().length(15, "GSTIN must be 15 characters").optional().or(z.literal("")),
  pan: z.string().length(10, "PAN must be 10 characters").optional().or(z.literal("")),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID format").optional().or(z.literal("")),
  
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().length(6, "Pincode must be 6 digits").optional().or(z.literal("")),
  }),
  
  bankDetails: z.object({
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    ifscCode: z.string().length(11, "IFSC must be 11 characters").optional().or(z.literal("")),
  }),

  // --- NEW FIELDS ---
  termsAndConditions: z.string().optional(),
  additionalNotes: z.string().optional(),
  authorizedSignatureUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// 2. Define the mutation function
const updateProfile = async (data) => {
  const { data: responseData } = await api.put('/users/profile', data);
  return responseData.data;
};

export default function SettingsPage() {
  const { user, updateUser: updateAuthContext } = useAuth();
  
  // 3. Setup react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(settingsSchema),
  });

  // 4. Setup mutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      toast.success('Profile updated successfully!');
      updateAuthContext(updatedUser);
      reset(updatedUser); // Reset form with new data, marks it as !isDirty
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    },
  });

  // 5. Pre-fill the form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        businessName: user.businessName || '',
        gstin: user.gstin || '',
        pan: user.pan || '',
        upiId: user.upiId || '',
        logoUrl: user.logoUrl || '',
        authorizedSignatureUrl: user.authorizedSignatureUrl || '',
        termsAndConditions: user.termsAndConditions || '',
        additionalNotes: user.additionalNotes || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || '',
        },
        bankDetails: {
          accountName: user.bankDetails?.accountName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          bankName: user.bankDetails?.bankName || '',
          ifscCode: user.bankDetails?.ifscCode || '',
        },
      });
    }
  }, [user, reset]);

  // 6. Handle form submission
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (!user) {
    return <div className="p-10 flex justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Settings</h1>
        <p className="text-lg text-brand-text mt-1">Manage your business and account details.</p>
      </header>

      <Tabs defaultValue="business" className="max-w-3xl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your public business details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" {...register('businessName')} />
                    {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Account Email</Label>
                  <Input id="email" type="email" value={user.email} disabled className="cursor-not-allowed bg-secondary" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input id="gstin" placeholder="15-character GSTIN" {...register('gstin')} />
                    {errors.gstin && <p className="text-xs text-red-500">{errors.gstin.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN</Label>
                    <Input id="pan" placeholder="10-character PAN" {...register('pan')} />
                    {errors.pan && <p className="text-xs text-red-500">{errors.pan.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" placeholder="https://your-domain.com/logo.png" {...register('logoUrl')} />
                  {errors.logoUrl && <p className="text-xs text-red-500">{errors.logoUrl.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>Your Business Address</CardTitle>
                <CardDescription>This will appear on your invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address.street">Street Address</Label>
                  <Input id="address.street" {...register('address.street')} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address.city">City</Label>
                    <Input id="address.city" {...register('address.city')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address.state">State</Label>
                    <Controller
                      name="address.state"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>
                            {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address.pincode">Pincode</Label>
                    <Input id="address.pincode" {...register('address.pincode')} />
                    {errors.address?.pincode && <p className="text-xs text-red-500">{errors.address.pincode.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Your default payment receiving details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="upiId">Default UPI ID (for QR Code)</Label>
                  <Input id="upiId" placeholder="yourname@upi" {...register('upiId')} />
                  {errors.upiId && <p className="text-xs text-red-500">{errors.upiId.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.accountName">Account Holder Name</Label>
                    <Input id="bankDetails.accountName" {...register('bankDetails.accountName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.accountNumber">Bank Account Number</Label>
                    <Input id="bankDetails.accountNumber" {...register('bankDetails.accountNumber')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.bankName">Bank Name</Label>
                    <Input id="bankDetails.bankName" {...register('bankDetails.bankName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.ifscCode">IFSC Code</Label>
                    <Input id="bankDetails.ifscCode" {...register('bankDetails.ifscCode')} />
                    {errors.bankDetails?.ifscCode && <p className="text-xs text-red-500">{errors.bankDetails.ifscCode.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="defaults">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Defaults</CardTitle>
                <CardDescription>Default text that will appear on new invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                  <Textarea 
                    id="termsAndConditions" 
                    {...register('termsAndConditions')}
                    rows={4}
                    placeholder="1. Please pay within 15 days."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea 
                    id="additionalNotes" 
                    {...register('additionalNotes')}
                    rows={3}
                    placeholder="Thank you for your business!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorizedSignatureUrl">Authorized Signature URL</Label>
                  <Input 
                    id="authorizedSignatureUrl" 
                    placeholder="https://your-domain.com/signature.png" 
                    {...register('authorizedSignatureUrl')} 
                  />
                  {errors.authorizedSignatureUrl && <p className="text-xs text-red-500">{errors.authorizedSignatureUrl.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <CardFooter className="mt-6 flex justify-end">
            <Button type="submit" disabled={mutation.isPending || !isDirty}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Tabs>
    </div>
  );
}