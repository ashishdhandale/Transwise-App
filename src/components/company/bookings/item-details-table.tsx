
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
  ewbNo: string;
  itemName: string;
  description: string;
  qty: number;
  actWt: number;
  chgWt: number;
  rate: number;
  freightOn: 'Act.wt' | 'Chg.wt';
  lumpsum: number;
  pvtMark: string;
  invoiceNo: string;
  dValue: number;
}

const initialRows: ItemRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  ewbNo: '',
  itemName: '',
  description: '',
  qty: 0,
  actWt: 0,
  chgWt: 0,
  rate: 0,
  freightOn: 'Act.wt',
  lumpsum: 0,
  pvtMark: '',
  invoiceNo: '',
  dValue: 0,
}));

const thClass = "p-1.5 h-9 bg-primary/10 text-primary font-semibold text-xs";
const tdClass = "p-1";
const inputClass = "h-8 text-xs";

export function ItemDetailsTable() {
  const [rows, setRows] = useState<ItemRow[]>(initialRows);

  const addRow = () => {
    setRows([...rows, { ...initialRows[0], id: rows.length + 1 }]);
  };
  
  const removeRow = (id: number) => {
      setRows(rows.filter(row => row.id !== id));
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
                            <TableCell className={`${tdClass} text-center`}>{index + 1}*</TableCell>
                            <TableCell className={tdClass}><Input type="text" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}>
                                <Select>
                                    <SelectTrigger className={inputClass}><SelectValue placeholder="Frm MAS" /></SelectTrigger>
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
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className={tdClass}><Input type="number" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="text" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="text" className={inputClass} /></TableCell>
                            <TableCell className={tdClass}><Input type="number" className={inputClass} /></TableCell>
                            <TableCell className={`${tdClass} text-center`}>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRow(row.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="flex justify-end">
             <Button variant="link" size="sm" onClick={addRow} className="text-sm">
                <Plus className="h-4 w-4 mr-1" />
                Ctrl+I to Add more
            </Button>
        </div>
    </div>
  );
}
