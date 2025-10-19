
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { sampleExistingUsers } from '@/lib/sample-data';
import type { LicenceType, ExistingUser } from '@/lib/types';
import { getLicenceTypes } from '@/lib/licence-data';
import { ClientOnly } from '../ui/client-only';

const formSchema = z.object({
  // Company Details
  companyId: z.string().optional(),
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  companyLogo: z.any().optional(),
  licenceType: z.string().min(1, { message: 'Please select a licence package.' }),
  maxBranches: z.coerce.number().min(0, 'Cannot be negative.').default(1),
  maxUsers: z.coerce.number().min(1, 'At least 1 user ID is required.'),
  headOfficeAddress: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  officeAddress2: z.string().optional(),
  state: z.string().min(1, { message: 'State is required.' }),
  city: zstring().min(1, { message: 'City is required.' }),
  transportId: z.string().optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format.' }).optional().or(z.literal('')),
  gstNo: z.string().length(15, { message: 'GST Number must be 15 characters.' }).optional().or(z.literal('')),
  companyContactNo: z.string().min(10, { message: 'Enter at least one valid contact number.' }),
  companyEmail: z.string().email({ message: 'Please enter a valid company email address.' }),

  // Auth. Person Details
  authPersonName: z.string().min(2, { message: 'Authorized person name is required.' }),
  authContactNo: z.string().min(10, { message: 'Enter at least one valid contact number.' }),
  authEmail: z.string().email({ message: 'Please enter a valid email address for login.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).optional().or(z.literal('')),
});

export type AddCompanyFormValues = z.infer<typeof formSchema>;

// This would typically come from a database sequence or a counter service
let companyCounter = 11;

const generateCompanyId = () => `COMP${companyCounter++}`;
const generateRandomPassword = () => Math.random().toString(36).substring(2, 10);


export default function AddCompanyForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const mode = searchParams.get('mode');

  const isViewMode = !!userId && mode !== 'edit';
  const isEditMode = !!userId && mode === 'edit';

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formTitle, setFormTitle] = useState('Add New User Business Details');
  const [licenceTypes, setLicenceTypes] = useState<LicenceType[]>([]);
  const [companyId, setCompanyId] = useState('');

  const form = useForm<AddCompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: '',
      companyName: '',
      licenceType: 'Trial',
      maxBranches: 1,
      maxUsers: 5,
      headOfficeAddress: '',
      officeAddress2: '',
      state: '',
      city: '',
      transportId: '',
      pan: '',
      gstNo: '',
      companyContactNo: '',
      companyEmail: '',
      authPersonName: '',
      authContactNo: '',
      authEmail: '',
      password: '',
    },
  });

  const handleResetForm = React.useCallback(() => {
    form.reset();
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCompanyId(generateCompanyId());
    form.setValue('password', generateRandomPassword());
  }, [form]);


  useEffect(() => {
    setLicenceTypes(getLicenceTypes());

    if (userId) { // View or Edit mode
      const userToView = sampleExistingUsers.find(u => String(u.id) === userId);
      if (userToView) {
        setFormTitle(isEditMode ? `Editing Details: ${userToView.companyName}` : `Viewing Details: ${userToView.companyName}`);
        setCompanyId(userToView.companyId);
        form.reset({
          companyId: userToView.companyId,
          companyName: userToView.companyName,
          licenceType: userToView.licenceType,
          maxBranches: userToView.maxBranches,
          maxUsers: userToView.maxUsers,
          headOfficeAddress: userToView.address,
          gstNo: userToView.gstNo,
          companyContactNo: userToView.contactNo,
          officeAddress2: '',
          state: userToView.state,
          city: userToView.city,
          transportId: userToView.transporterId || '',
          pan: userToView.pan,
          companyEmail: userToView.companyEmail,
          authPersonName: userToView.authPersonName,
          authContactNo: userToView.authContactNo,
          authEmail: userToView.authEmail,
          password: '' // Clear password field for security
        });
      }
    } else { // New mode
      setFormTitle('Add New User Business Details');
      // Set client-side only values after initial render
      setCompanyId(generateCompanyId());
      form.setValue('password', generateRandomPassword());
    }
  }, [isViewMode, isEditMode, userId, form]);

  async function onSubmit(values: AddCompanyFormValues) {
    setIsSubmitting(true);
    console.log('Form Submitted:', values);

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isEditMode) {
      toast({
        title: "Company Updated Successfully",
        description: `${values.companyName} has been updated.`,
      });
    } else {
      toast({
        title: "Company Created Successfully",
        description: `${values.companyName} has been added and the owner account is ready.`,
      });
      handleResetForm();
    }

    setIsSubmitting(false);
  }

  const isDisabled = isViewMode || isSubmitting;

  return (
    <ClientOnly>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{formTitle}</CardTitle>
              <CardDescription>
                {isViewMode ? 'Viewing company details.' : isEditMode ? 'Modify the company information and resource limits.' : 'Enter the information for the new company.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company ID</FormLabel>
                      <FormControl>
                        <Input {...field} value={companyId} disabled className="font-bold text-muted-foreground bg-muted/50" />
                      </FormControl>
                      <FormDescription>This ID is auto-generated.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Example: Transwise Logistics" {...field} disabled={isDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Licence Package</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {licenceTypes.map(lt => (
                            <SelectItem key={lt.id} value={lt.name}>{lt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxBranches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Branches</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 2" {...field} disabled={isDisabled} />
                      </FormControl>
                      <FormDescription>Branches allowed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of User IDs</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 5" {...field} disabled={isDisabled} />
                      </FormControl>
                      <FormDescription>Sub-user IDs allowed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="companyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isDisabled}>
                        Choose File
                      </Button>
                      <FormControl>
                        <Input
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            field.onChange(file);
                            setSelectedFileName(file?.name || null);
                          }}
                          disabled={isDisabled}
                        />
                      </FormControl>
                      {selectedFileName ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span>{selectedFileName}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              field.onChange(null);
                              setSelectedFileName(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            disabled={isDisabled}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No file selected</span>
                      )}
                    </div>
                    <FormDescription>Upload the company's logo (optional).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headOfficeAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Head Office Add.</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Head Office Address" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="officeAddress2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Add. 2</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Branch or secondary address" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CHHATTISGARH">CHHATTISGARH</SelectItem>
                          <SelectItem value="MAHARASHTRA">MAHARASHTRA</SelectItem>
                          <SelectItem value="KARNATAKA">KARNATAKA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city name" {...field} disabled={isDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transport ID</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678911" {...field} disabled={isDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN</FormLabel>
                      <FormControl>
                        <Input placeholder="ABCDE1234F" {...field} disabled={isDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="gstNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST No</FormLabel>
                    <FormControl>
                      <Input placeholder="15-digit GSTIN" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyContactNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact No</FormLabel>
                    <FormControl>
                      <Input placeholder="9890356869, 8888822222" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormDescription>
                      Put "," between numbers to separate them.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@company.com" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Authorized Person Details (Owner/Login)</CardTitle>
              <CardDescription>
                {isViewMode ? 'Details for the primary user account.' : isEditMode ? 'Modify primary user account details.' : "Create the primary user account for the company. This user will have the 'Company' role."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="authPersonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auth. Person</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authContactNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact No (for Auth. Person)</FormLabel>
                    <FormControl>
                      <Input placeholder="9890356869, 8888822643" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Email (User ID)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="owner@company.com" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isViewMode && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isEditMode ? 'New Password' : 'Initial Password'}</FormLabel>
                      <FormControl>
                        <Input
                          type={isEditMode ? 'password' : 'text'}
                          {...field}
                          disabled={isDisabled}
                          readOnly={!isEditMode && !isViewMode && !isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        {isEditMode ? 'Leave blank to keep the current password.' : 'The owner can change this on first login.'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {!isViewMode && (
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add User'}
              </Button>
              <Button type="button" variant="outline" onClick={handleResetForm} disabled={isSubmitting || isEditMode}>
                Reset
              </Button>
            </div>
          )}
        </form>
      </Form>
    </ClientOnly>
  );
}
