'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaultTemplates = {
  email: `Subject: Exclusive Offer Just for You!

Hello [Customer Name],

We're excited to offer you a special discount on our services. For a limited time, get [Discount]% off when you subscribe.

Use code: [Coupon Code]

Click here to learn more: [Offer Link]

Best,
The Transwise Team`,
  whatsapp: `🚀 Special Offer for [Customer Name]! 🚀

Get [Discount]% off your next subscription with Transwise. 

Use code *[Coupon Code]*.

Tap to redeem: [Offer Link]

Hurry, this offer won't last long!`,
};

export function MarketingTemplates() {
  const [templateType, setTemplateType] = useState<'email' | 'whatsapp'>('email');
  const [templateContent, setTemplateContent] = useState(defaultTemplates.email);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleTypeChange = (value: 'email' | 'whatsapp') => {
    setTemplateType(value);
    setTemplateContent(defaultTemplates[value]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log(`Saving ${templateType} template:`, templateContent);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    toast({
      title: 'Template Saved',
      description: `The ${templateType} template has been updated successfully.`,
    });
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Customizable Marketing Templates</CardTitle>
        <CardDescription>
          Edit the default templates for emails and WhatsApp messages. Use placeholders like [Customer Name] or [Coupon Code].
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={handleTypeChange} value={templateType}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a template type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="email">Email Template</SelectItem>
                <SelectItem value="whatsapp">WhatsApp Template</SelectItem>
            </SelectContent>
        </Select>
        
        <Textarea
          value={templateContent}
          onChange={(e) => setTemplateContent(e.target.value)}
          rows={12}
          placeholder="Enter your template content here..."
        />
        
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Template
        </Button>
      </CardContent>
    </Card>
  );
}
