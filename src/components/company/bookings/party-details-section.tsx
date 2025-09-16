
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { bookingOptions } from '@/lib/booking-data';

export function PartyDetailsSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
            {/* Consignor Side */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                <div className="space-y-4">
                    {/* GST */}
                     <div className="space-y-1">
                        <Label>Consignor GST</Label>
                        <div className="flex gap-1">
                             <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="GST NO [Party Name]" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bookingOptions.parties.map(p => <SelectItem key={p.gst} value={p.gst}>{`${p.gst} [${p.name}]`}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button size="icon" variant="outline" className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 shrink-0">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    {/* Name */}
                     <div className="space-y-1">
                        <Label>Consignor Name*</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Party Name[GST NO]" />
                            </SelectTrigger>
                             <SelectContent>
                                {bookingOptions.parties.map(p => <SelectItem key={p.gst} value={p.name}>{`${p.name} [${p.gst}]`}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="flex md:flex-col items-center justify-center h-full gap-2 text-muted-foreground pt-6">
                     <div className="hidden md:block w-px h-24 bg-border"></div>
                </div>

                {/* Address & Mobile */}
                <div className="space-y-4">
                     <div className="space-y-1">
                        <Label>C.nor Address</Label>
                        <Textarea placeholder="Address Line" rows={2} />
                    </div>
                     <div className="space-y-1">
                        <Label>Mobile No.</Label>
                        <Input placeholder="10 Digits Only" />
                    </div>
                </div>
            </div>

             {/* Consignee Side */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                 <div className="space-y-4">
                    {/* GST */}
                     <div className="space-y-1">
                        <Label>Consignee GST</Label>
                         <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="GST NO [PARTY NAME]" />
                            </SelectTrigger>
                            <SelectContent>
                                {bookingOptions.parties.map(p => <SelectItem key={p.gst} value={p.gst}>{`${p.gst} [${p.name}]`}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Name */}
                     <div className="space-y-1">
                        <Label>Consignee Name*</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="PARTY NAME1 [GST NO]" />
                            </SelectTrigger>
                             <SelectContent>
                                {bookingOptions.parties.map(p => <SelectItem key={p.gst} value={p.name}>{`${p.name} [${p.gst}]`}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                 <div className="flex md:flex-col items-center justify-center h-full gap-2 text-muted-foreground pt-6">
                     <div className="hidden md:block w-px h-24 bg-border"></div>
                </div>

                {/* Address & Mobile */}
                <div className="space-y-4">
                     <div className="space-y-1">
                        <Label>C.nee Address</Label>
                        <Textarea placeholder="Address Line" rows={2} />
                    </div>
                     <div className="space-y-1">
                        <Label>Mobile No.</Label>
                        <Input placeholder="10 Digits Only" />
                    </div>
                </div>
            </div>
        </div>
    );
}
