
'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

const printOptions = [
    { id: 'printAll', label: 'ALL' },
    { id: 'printSender', label: "Sender" },
    { id: 'printReceiver', label: "Receiver" },
    { id: 'printDriver', label: "Driver" },
    { id: 'printOffice', label: "Office Copy" },
];

const notificationOptions = [
    { id: 'notifSms', label: 'SMS' },
    { id: 'notifWhatsapp', label: 'Whats App' },
    { id: 'notifEmail', label: 'Email' },
    { id: 'notifPayment', label: 'Payment link' },
];

const settingsSchema = z.object({
  printCopy: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one print option.',
  }),
  sendNotification: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one notification option.',
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const LOCAL_STORAGE_KEY = 'transwise_general_instructions_settings';

export function GeneralInstructionsSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      printCopy: ['printAll', 'printSender', 'printReceiver', 'printDriver', 'printOffice'],
      sendNotification: ['notifSms', 'notifWhatsapp'],
    },
  });
  
  const watchedPrintCopy = useWatch({
      control: form.control,
      name: 'printCopy'
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        form.reset(parsed);
      }
    } catch (error) {
      console.error("Failed to load general instructions settings", error);
    }
  }, [form]);

  useEffect(() => {
    const allPrintIds = printOptions.filter(o => o.id !== 'printAll').map(o => o.id);
    const allSelected = allPrintIds.every(id => watchedPrintCopy.includes(id));

    if (allSelected && !watchedPrintCopy.includes('printAll')) {
        form.setValue('printCopy', ['printAll', ...allPrintIds], { shouldDirty: true });
    } else if (!allSelected && watchedPrintCopy.includes('printAll')) {
        form.setValue('printCopy', watchedPrintCopy.filter(id => id !== 'printAll'), { shouldDirty: true });
    }
  }, [watchedPrintCopy, form]);

  const handleAllChange = (checked: boolean) => {
      const allPrintIds = printOptions.map(o => o.id);
      if (checked) {
          form.setValue('printCopy', allPrintIds, { shouldDirty: true });
      } else {
          form.setValue('printCopy', [], { shouldDirty: true });
      }
  };


  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: 'Settings Saved',
        description: 'General instruction preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not save settings.',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">General Instructions</CardTitle>
        <CardDescription>Set the default print and notification settings for new bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="printCopy"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base font-semibold">Default Print Copy</FormLabel>
                        </div>
                         <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {printOptions.map((item) => (
                                <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="printCopy"
                                    render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-2 space-y-0"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (item.id === 'printAll') {
                                                            handleAllChange(!!checked);
                                                        } else {
                                                            return checked
                                                            ? field.onChange([...field.value, item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                                )
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {item.label}
                                            </FormLabel>
                                        </FormItem>
                                    )
                                    }}
                                />
                            ))}
                        </div>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="sendNotification"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base font-semibold">Default Notifications</FormLabel>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {notificationOptions.map((item) => (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="sendNotification"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-2 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item.id
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {item.label}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        </div>
                    </FormItem>
                )}
                />
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Instructions
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
