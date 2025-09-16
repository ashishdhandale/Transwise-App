'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const couponSchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters').max(20),
  discount: z.coerce.number().min(1, 'Discount must be at least 1%').max(100, 'Discount cannot exceed 100%'),
  expiresAt: z.date().optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface Coupon extends CouponFormValues {
  id: number;
  link: string;
}

const initialCoupons: Coupon[] = [
    { id: 1, code: 'SUMMER24', discount: 15, expiresAt: new Date('2024-08-31'), link: 'https://transwise.in/offer/SUMMER24' },
    { id: 2, code: 'NEWUSER10', discount: 10, link: 'https://transwise.in/offer/NEWUSER10' },
];


export function CouponGenerator() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      discount: 10,
    }
  });

  const generateRandomCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setValue('code', randomCode);
  };

  const onSubmit = async (data: CouponFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    const newCoupon: Coupon = {
      ...data,
      id: coupons.length + 1,
      link: `https://transwise.in/offer/${data.code}`,
    };
    setCoupons(prev => [newCoupon, ...prev]);
    toast({
      title: 'Coupon Generated',
      description: `Coupon code "${data.code}" has been created successfully.`,
    });
    reset();
    setIsSubmitting(false);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'The link has been copied to your clipboard.' });
  };
  
  const deleteCoupon = (id: number) => {
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Coupon Deleted', variant: 'destructive'});
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generate Coupon</CardTitle>
          <CardDescription>Create a new coupon code and offer link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <div className="flex gap-2">
                <Input id="code" {...register('code')} />
                <Button type="button" variant="outline" onClick={generateRandomCode}>Generate</Button>
              </div>
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input id="discount" type="number" {...register('discount')} />
               {errors.discount && <p className="text-sm text-destructive">{errors.discount.message}</p>}
            </div>
            
            <div className="space-y-2">
                <Label>Expiration Date (Optional)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !control._getWatch('expiresAt') && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {control._getWatch('expiresAt') ? format(control._getWatch('expiresAt'), "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={control._getWatch('expiresAt')}
                            onSelect={(date) => setValue('expiresAt', date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Coupon
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generated Codes</CardTitle>
          <CardDescription>List of all active coupon codes.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                            <TableCell className="font-medium">{coupon.code}</TableCell>
                            <TableCell>{coupon.discount}%</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(coupon.link)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCoupon(coupon.id)}>
                                    <Trash2 className="h-4 w-4" />
                               </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
