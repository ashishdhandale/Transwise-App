

'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import type { AllCompanySettings } from '@/app/company/settings/actions';

export const termsSchema = z.object({
  termsAndConditions: z.array(z.object({ value: z.string().min(1, 'Term cannot be empty.') })),
});

export function TermsSettings() {
  const form = useFormContext<AllCompanySettings>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'termsAndConditions',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Terms & Conditions</CardTitle>
        <CardDescription>
          Manage the terms and conditions that appear on your printed lorry receipts. Add, remove, or edit lines as needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`termsAndConditions.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea placeholder={`Term line ${index + 1}`} {...field} rows={1} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="text-destructive flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ value: '' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Term
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
