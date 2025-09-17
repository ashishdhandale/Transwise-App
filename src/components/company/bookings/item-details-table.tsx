
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/booking-data';
import type { ColumnSetting } from '@/components/company/settings/item-details-settings';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ItemRow {
  id: number;
}

const thClass = "p-1.5 h-9 bg-primary/10 text-primary font-semibold text-xs text-center";
const tdClass = "p-1";
const inputClass = "h-8 text-xs px-1";

const BOOKING_SETTINGS_KEY = 'transwise_booking_settings';
const ITEM_DETAILS_SETTINGS_KEY = 'transwise_item_details_settings';
const DEFAULT_ROWS = 2;

const defaultColumns: ColumnSetting[] = [
    { id: 'ewbNo', label: 'EWB no.', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[220px]' },
    { id: 'itemName', label: 'Item Name*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[160px]' },
    { id: 'description', label: 'Description*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[220px]' },
    { id: 'qty', label: 'Qty*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
    { id: 'actWt', label: 'Act.wt*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
    { id: 'chgWt', label: 'Chg.wt*', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
    { id: 'rate', label: 'Rate', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[100px]' },
    { id: 'freightOn', label: 'Freight ON', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[130px]' },
    { id: 'lumpsum', label: 'Lumpsum', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[120px]' },
    { id: 'pvtMark', label: 'Pvt.Mark', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
    { id: 'invoiceNo', label: 'Invoice No', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
    { id: 'dValue', label: 'D.Value', isVisible: true, isCustom: false, isRemovable: false, width: 'w-[140px]' },
];

const getInputForColumn = (columnId: string, index: number) => {
    switch(columnId) {
        case 'ewbNo':
            return <Input type="text" className={inputClass} maxLength={12} />;
        case 'itemName':
            return (
                 <Select defaultValue="Frm MAS">
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {bookingOptions.items.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        case 'description':
            return <Input type="text" placeholder="type description" className={inputClass} />;
        case 'freightOn':
            return (
                <Select defaultValue="Act.wt">
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Act.wt">Act.wt</SelectItem>
                        <SelectItem value="Chg.wt">Chg.wt</SelectItem>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Quantity">Quantity</SelectItem>
                    </SelectContent>
                </Select>
            );
        case 'dValue':
            return <Input type="number" className={inputClass} defaultValue={index === 0 ? "12345" : ""} />;
        case 'qty':
        case 'actWt':
        case 'chgWt':
        case 'rate':
        case 'lumpsum':
             return <Input type="number" className={inputClass} />;
        case 'pvtMark':
        case 'invoiceNo':
            return <Input type="text" className={inputClass} />;
        default: // For custom columns
            return <Input type="text" className={inputClass} />;
    }
}

export function ItemDetailsTable() {
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [columns, setColumns] = useState<ColumnSetting[]>(defaultColumns);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let initialRowCount = DEFAULT_ROWS;
    try {
      const savedBookingSettings = localStorage.getItem(BOOKING_SETTINGS_KEY);
      if (savedBookingSettings) {
        const parsed = JSON.parse(savedBookingSettings);
        if (parsed.defaultItemRows && typeof parsed.defaultItemRows === 'number') {
          initialRowCount = parsed.defaultItemRows;
        }
      }

      const savedItemDetailsSettings = localStorage.getItem(ITEM_DETAILS_SETTINGS_KEY);
      if (savedItemDetailsSettings) {
          const parsed = JSON.parse(savedItemDetailsSettings);
          if (parsed.columns) {
              setColumns(parsed.columns);
          }
      }

    } catch (error) {
      console.error("Could not load settings, using defaults.", error);
    }
    
    setRows(Array.from({ length: initialRowCount }, (_, i) => ({ id: Date.now() + i })));
  }, [isClient]);

  const addRow = () => {
    setRows([...rows, { id: Date.now() }]);
  };
  
  const removeRow = (id: number) => {
      if (rows.length > 1) { 
        setRows(rows.filter(row => row.id !== id));
      }
  }

  if (!isClient) {
    // Render a placeholder or the default state on the server to avoid hydration mismatch
    return (
        <div className="space-y-2">
            <div className="overflow-x-auto border rounded-md">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={`${thClass} w-[40px]`}>#</TableHead>
                            {defaultColumns.filter(c => c.isVisible).map(col => (
                                <TableHead key={col.id} className={cn(thClass, col.width)}>{col.label}</TableHead>
                            ))}
                            <TableHead className={`${thClass} w-[50px] text-center`}>Del</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: DEFAULT_ROWS }, (_, index) => (
                             <TableRow key={`skeleton-${index}`}>
                                <TableCell className={`${tdClass} text-center font-semibold text-red-500`}>{index + 1}*</TableCell>
                                {defaultColumns.filter(c => c.isVisible).map(col => (
                                    <TableCell key={`skeleton-${index}-${col.id}`} className={tdClass}>
                                        <div className="h-8 bg-muted rounded-md animate-pulse"></div>
                                    </TableCell>
                                ))}
                                <TableCell className={`${tdClass} text-center`}></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-end h-8"></div>
        </div>
    );
  }

  const visibleColumns = columns.filter(c => c.isVisible);

  return (
    <div className="space-y-2">
        <div className="overflow-x-auto border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className={`${thClass} w-[40px]`}>#</TableHead>
                        {visibleColumns.map(col => (
                            <TableHead key={col.id} className={cn(thClass, col.width)}>{col.label}</TableHead>
                        ))}
                        <TableHead className={`${thClass} w-[50px] text-center`}>Del</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={row.id}>
                            <TableCell className={`${tdClass} text-center font-semibold text-red-500`}>{index + 1}*</TableCell>
                            {visibleColumns.map(col => (
                                <TableCell key={`${row.id}-${col.id}`} className={tdClass}>
                                    {getInputForColumn(col.id, index)}
                                </TableCell>
                            ))}
                            <TableCell className={`${tdClass} text-center`}>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRow(row.id)} disabled={rows.length <= 1}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="flex justify-end items-center gap-4">
            <Button variant="link" size="sm" onClick={addRow} className="text-sm text-blue-600 hover:text-blue-800">
                <Plus className="h-4 w-4 mr-1" />
                Ctrl+I to Add more
            </Button>
            <div className="flex items-center space-x-2">
                <Checkbox id="updateRates" />
                <Label htmlFor="updateRates">Update Rates</Label>
            </div>
        </div>
    </div>
  );
}
