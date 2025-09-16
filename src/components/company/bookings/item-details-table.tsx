
'use client';

import { useState } from 'react';
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

interface ItemRow {
  id: number;
}

const initialRows: ItemRow[] = Array.from({ length: 6 }, (_, i) => ({ id: i + 1 }));

const thClass = "p-1.5 h-9 bg-primary/10 text-primary font-semibold text-xs text-center";
const tdClass = "p-1";
const inputClass = "h-8 text-xs";

export function ItemDetailsTable() {
  const [rows, setRows] = useState<ItemRow[]>(initialRows);

  const addRow = () => {
    setRows([...rows, { id: rows.length + 1 }]);
  };
  
  const removeRow = (id: number) => {
      if (rows.length > 1) { // Prevent removing the last row
        setRows(rows.filter(row => row.id !== id));
      }
  }

  return (
    <div className="space-y-2">
        <div className="overflow-x-auto border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className={`${thClass} w-[40px]`}>#</TableHead>
                        <TableHead className={`${thClass} w-[120px]`}>EWB no.</TableHead>
                        <TableHead className={`${thClass} w-[150px]`}>Item Name*</TableHead>
                        <TableHead className={`${thClass} w-[180px]`}>Description*</TableHead>
                        <TableHead className={`${thClass} w-[80px]`}>Qty*</TableHead>
                        <TableHead className={`${thClass} w-[80px]`}>Act.wt*</TableHead>
                        <TableHead className={`${thClass} w-[80px]`}>Chg.wt*</TableHead>
                        <TableHead className={`${thClass} w-[80px]`}>Rate</TableHead>
                        <TableHead className={`${thClass} w-[100px]`}>Freight ON</TableHead>
                        <TableHead className={`${thClass} w-[100px]`}>Lumpsum</TableHead>
                        <TableHead className={`${thClass} w-[100px]`}>Pvt.Mark</TableHead>
                        <TableHead className={`${thClass} w-[100px]`}>Invoice No</TableHead>
                        <TableHead className={`${thClass} w-[100px]`}>D.Value</TableHead>
                        <TableHead className={`${thClass} w-[50px] text-center`}>Del</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={row.id}>
                            <TableCell className={`${tdClass} text-center font-semibold text-red-500`}>{index + 1}*</TableCell>
                            <TableCell className={tdClass}><Input type="text" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}>
                                <Select defaultValue="Frm MAS">
                                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {bookingOptions.items.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className={tdClass}><Input type="text" placeholder="type descritpior" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="number" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="number" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="number" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="number" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}>
                                 <Select defaultValue="Act.wt">
                                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Act.wt">Act.wt</SelectItem>
                                        <SelectItem value="Chg.wt">Chg.wt</SelectItem>
                                        <SelectItem value="Fixed">Fixed</SelectItem>
                                        <SelectItem value="Quantity">Quantity</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className={tdClass}><Input type="number" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="text" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="text" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="number" className={inputClass} defaultValue={index === 0 ? "12345" : ""} /></TableCell>
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
        <div className="flex justify-end">
             <Button variant="link" size="sm" onClick={addRow} className="text-sm text-blue-600 hover:text-blue-800">
                <Plus className="h-4 w-4 mr-1" />
                Ctrl+I to Add more
            </Button>
        </div>
    </div>
  );
}
