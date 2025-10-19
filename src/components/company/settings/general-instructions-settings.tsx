
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import { Input } from '@/components/ui/input';

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

export function GeneralInstructionsSettings() {
  const form = useFormContext<AllCompanySettings>();

  const handleAllChange = (checked: boolean) => {
    const allPrintIds = printOptions.map(o => o.id);
    form.setValue('printCopy', checked ? allPrintIds : [], { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">General Instructions</CardTitle>
        <CardDescription>Set the default print, notification, and station settings for new bookings.</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField
                control={form.control}
                name="defaultFromStation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Default From Station</FormLabel>
                     <FormControl>
                        <Input placeholder="Enter default station..." {...field} />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">This station will be automatically selected on the New Booking page.</p>
                  </FormItem>
                )}
              />
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
                                                              const newValue = checked
                                                                  ? [...(field.value || []), item.id]
                                                                  : field.value?.filter((value) => value !== item.id);
                                                              field.onChange(newValue);
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
                                render={({ field }) => (
                                  <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-2 space-y-0"
                                  >
                                      <FormControl>
                                      <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                          return checked
                                              ? field.onChange([...(field.value || []), item.id])
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
                                )}
                              />
                          ))}
                        </div>
                    </FormItem>
                )}
              />
          </div>
      </CardContent>
    </Card>
  );
}
