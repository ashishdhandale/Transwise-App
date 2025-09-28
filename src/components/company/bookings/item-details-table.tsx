

'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';
import type { City, Customer, Item, RateList, StationRate } from '@/lib/types';
import { AddItemDialog } from '../master/add-item-dialog';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/ui/client-only';
import { getRateLists } from '@/lib/rate-list-data';


export interface ItemRow {
  id: number;
  ewbNo: string;
  itemName: string;
  description: string;
  wtPerUnit: string;
  qty: string;
  actWt: string;
  chgWt: string;
  rate: string;
  freightOn: string;
  lumpsum: string;
  pvtMark: string;
  invoiceNo: string;
  dValue: string;
  [key: string]: any;
}

const thClass = "p-1.5 h-9 bg-primary/10 text-primary font-semibold text-xs text-center sticky top-0 z-10 whitespace-nowrap";
const tdClass = "p-1";
const tfClass = "p-1.5 h-9 bg-primary/10 text-primary font-bold text-xs whitespace-nowrap";
const inputClass = "h-8 text-xs px-1";

let nextId = 1;
const createEmptyRow = (): ItemRow => ({
    id: nextId++,
    ewbNo: '',
    itemName: '',
    description: '',
    wtPerUnit: '',
    qty: '',
    actWt: '',
    chgWt: '',
    rate: '',
    freightOn: 'Act.wt',
    lumpsum: '',
    pvtMark: '',
    invoiceNo: '',
    dValue: '',
});

interface ItemDetailsTableProps {
    rows: ItemRow[];
    onRowsChange: (rows: ItemRow[]) => void;
    isViewOnly?: boolean;
    sender: Customer | null;
    receiver: Customer | null;
    fromStation: City | null;
    toStation: City | null;
    onQuotationApply: (lrType: string) => void;
}

export function ItemDetailsTable({ 
    rows, 
    onRowsChange, 
    isViewOnly = false,
    sender,
    receiver,
    fromStation,
    toStation,
    onQuotationApply,
}: ItemDetailsTableProps) {
  const [itemOptions, setItemOptions] = useState<Item[]>([]);
  const [rateLists, setRateLists] = useState<RateList[]>([]);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [initialItemData, setInitialItemData] = useState<Partial<Item> | null>(null);
  const [weightWarning, setWeightWarning] = useState<{ rowIndex: number; value: string } | null>(null);
  const [nextFocusRef, setNextFocusRef] = useState<React.RefObject<HTMLInputElement> | null>(null);
  const { toast } = useToast();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const loadItemsAndRates = useCallback(() => {
    try {
        const savedItems = localStorage.getItem('transwise_items');
        if (savedItems) {
            setItemOptions(JSON.parse(savedItems));
        }
        setRateLists(getRateLists());
    } catch (error) {
        console.error("Failed to load master data", error);
    }
  }, []);
  
  useEffect(() => {
    loadItemsAndRates();
  }, [loadItemsAndRates]);

  const activeRateList = useMemo(() => {
    if (!rateLists.length) return null;

    if (sender) {
        const customerRateList = rateLists.find(rl => 
            !rl.isStandard && rl.customerIds?.includes(sender.id)
        );
        if (customerRateList) {
            return customerRateList;
        }
    }
    
    return rateLists.find(rl => rl.isStandard) || null;
  }, [sender, rateLists]);

  useEffect(() => {
    if (nextFocusRef?.current && !weightWarning) {
      nextFocusRef.current.focus();
      setNextFocusRef(null);
    }
  }, [nextFocusRef, weightWarning]);

  const calculateLumpsum = useCallback((row: ItemRow) => {
    const qty = parseFloat(row.qty) || 0;
    const rate = parseFloat(row.rate) || 0;
    const actWt = parseFloat(row.actWt) || 0;
    const chgWt = parseFloat(row.chgWt) || 0;

    switch(row.freightOn) {
        case 'Quantity':
            return qty * rate;
        case 'Act.wt':
            return actWt * rate;
        case 'Chg.wt':
            return chgWt * rate;
        case 'Fixed':
            return parseFloat(row.lumpsum) || 0;
        default:
            return 0;
    }
  }, []);

  useEffect(() => {
    let hasChanged = false;
    const updatedRows = rows.map(row => {
        const newRow = { ...row };
        if (row.freightOn !== 'Fixed') {
            const newLumpsum = calculateLumpsum(row);
            const currentLumpsum = parseFloat(row.lumpsum) || 0;
            if (Math.abs(newLumpsum - currentLumpsum) > 0.001) {
                newRow.lumpsum = newLumpsum > 0 ? newLumpsum.toFixed(2) : '';
                hasChanged = true;
            }
        }
        return newRow;
    });

    if (hasChanged) {
        onRowsChange(updatedRows);
    }
  }, [rows, calculateLumpsum, onRowsChange]);

  const updateRow = (rowIndex: number, newRowData: Partial<ItemRow>) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], ...newRowData };
    onRowsChange(newRows);
  };


  const handleInputChange = (rowIndex: number, columnId: string, value: any) => {
    const newRows = [...rows];
    let newRow = { ...newRows[rowIndex] };
    
    let processedValue = value;
    
    newRow[columnId] = processedValue;
    
    // Automatic calculation for Actual Weight
    if (columnId === 'qty' || columnId === 'wtPerUnit') {
        const qty = parseFloat(newRow.qty) || 0;
        const wtPerUnit = parseFloat(newRow.wtPerUnit) || 0;
        if(qty === 0 || wtPerUnit === 0) {
            newRow.wtPerUnit = '';
        }
        const actWt = qty * wtPerUnit;
        newRow.actWt = actWt > 0 ? actWt.toFixed(2) : '';
        newRow.chgWt = actWt > 0 ? actWt.toFixed(2) : ''; // Also update chgWt
    }
    
    if (columnId === 'freightOn') {
        if (value === 'Fixed') {
            newRow.rate = '0'; 
            newRow.lumpsum = '';
        } else {
            const recalulatedLumpsum = calculateLumpsum(newRow);
            newRow.lumpsum = recalulatedLumpsum > 0 ? recalulatedLumpsum.toString() : '';
        }
    }
    
    const shouldApplyRate = ['itemName', 'wtPerUnit', 'qty'].includes(columnId);

    if (activeRateList && shouldApplyRate && fromStation && toStation && sender && receiver) {
        const selectedItemName = newRow.itemName || 'Any';
        const wtPerUnit = parseFloat(newRow.wtPerUnit) || 0;

        const findRate = (rateSource: StationRate[]): StationRate | undefined => {
            const exactMatch = rateSource.find(sr => 
                sr.fromStation === fromStation.name &&
                sr.toStation === toStation.name &&
                sr.senderName === sender.name &&
                sr.receiverName === receiver.name &&
                sr.itemName === selectedItemName &&
                (sr.wtPerUnit || 0) === wtPerUnit
            );
            if (exactMatch) return exactMatch;

            const routeItemMatch = rateSource.find(sr =>
                sr.fromStation === fromStation.name &&
                sr.toStation === toStation.name &&
                sr.senderName === sender.name &&
                sr.receiverName === receiver.name &&
                sr.itemName === selectedItemName &&
                !sr.wtPerUnit
            );
            if (routeItemMatch) return routeItemMatch;

            const genericRouteMatch = rateSource.find(sr =>
                sr.fromStation === fromStation.name &&
                sr.toStation === toStation.name &&
                sr.itemName === 'Any'
            );
            return genericRouteMatch;
        };
        
        let foundRate = findRate(activeRateList.stationRates);
        
        if (foundRate) {
            newRow.rate = String(foundRate.rate);
            newRow.freightOn = foundRate.rateOn;
            if (foundRate.lrType && onQuotationApply) {
                onQuotationApply(foundRate.lrType);
            }
        } else if (activeRateList.isStandard && selectedItemName !== 'Any') {
            const itemRate = activeRateList.itemRates.find(ir => {
                const item = itemOptions.find(i => i.id.toString() === ir.itemId);
                return item?.name === selectedItemName;
            });
            if (itemRate) {
                newRow.rate = String(itemRate.rate);
                newRow.freightOn = itemRate.rateOn;
            }
        }
    }
    
    newRows[rowIndex] = newRow;
    onRowsChange(newRows);
  };
  
    const handleChgWtBlur = (rowIndex: number) => {
        const row = rows[rowIndex];
        const actWt = parseFloat(row.actWt) || 0;
        const chgWt = parseFloat(row.chgWt) || 0;

        if (chgWt > 0 && chgWt < actWt) {
            setWeightWarning({ rowIndex, value: row.chgWt });
        }
    }

    const handleWeightWarningConfirm = () => {
        if (!weightWarning) return;
        
        const rateRef = { current: inputRefs.current[`rate-${rows[weightWarning.rowIndex].id}`] };
        setNextFocusRef(rateRef);
        setWeightWarning(null);
    };

    const handleWeightWarningCancel = () => {
        if (!weightWarning) return;
        const { rowIndex } = weightWarning;
        const row = rows[rowIndex];
        updateRow(rowIndex, { chgWt: row.actWt, freightOn: 'Act.wt' });
        
        const chgWtRef = { current: inputRefs.current[`chgWt-${row.id}`] };
        setNextFocusRef(chgWtRef);
        setWeightWarning(null);
    };


  const handleOpenAddItem = (query?: string) => {
    setInitialItemData(query ? { name: query } : null);
    setIsAddItemOpen(true);
  };
  
   const handleSaveItem = (itemData: Omit<Item, 'id'>) => {
        try {
            const newId = itemOptions.length > 0 ? Math.max(...itemOptions.map(i => i.id)) + 1 : 1;
            const newItem: Item = { id: newId, ...itemData };
            const updatedItems = [newItem, ...itemOptions];
            localStorage.setItem('transwise_items', JSON.stringify(updatedItems));
            setItemOptions(updatedItems);
            toast({ title: 'Item Added', description: `"${itemData.name}" has been added to your master list.` });
            return true;
        } catch (error) {
            console.error("Failed to save new item", error);
            toast({ title: 'Error', description: 'Could not save new item.', variant: 'destructive' });
            return false;
        }
    };
    
    const uppercaseItemOptions = useMemo(() => itemOptions.map(i => ({
        label: i.name.toUpperCase(), value: i.name
    })), [itemOptions]);

  const addRow = () => {
    onRowsChange([...rows, createEmptyRow()]);
  };
  
  const removeRow = (id: number) => {
      if (rows.length > 1) { 
        onRowsChange(rows.filter(row => row.id !== id));
      }
  }
  
  const totals = useMemo(() => {
      const filledRows = rows.filter(row => row.itemName || parseFloat(row.qty) > 0 || parseFloat(row.actWt) > 0);
      return {
          itemCount: filledRows.length,
          qty: rows.reduce((sum, row) => sum + (parseFloat(row.qty) || 0), 0),
          actWt: rows.reduce((sum, row) => sum + (parseFloat(row.actWt) || 0), 0),
          chgWt: rows.reduce((sum, row) => sum + (parseFloat(row.chgWt) || 0), 0),
      }
  }, [rows]);

  return (
    <ClientOnly fallback={<div className="h-24 bg-muted rounded-md animate-pulse"></div>}>
      <div className="overflow-x-auto relative border rounded-md">
        <Table className="table-auto w-full">
          <TableHeader>
              <TableRow>
                <TableHead className={cn(thClass, 'w-[30px]')}>#</TableHead>
                <TableHead className={cn(thClass, 'w-[160px]')}>EWB No</TableHead>
                <TableHead className={cn(thClass, 'w-[160px]')}>Item Name*</TableHead>
                <TableHead className={cn(thClass, 'w-[160px]')}>Description*</TableHead>
                <TableHead className={cn(thClass, 'w-[80px]')}>Wt/Unit</TableHead>
                <TableHead className={cn(thClass, 'w-[60px]')}>Qty*</TableHead>
                <TableHead className={cn(thClass, 'w-[60px]')}>Act.wt*</TableHead>
                <TableHead className={cn(thClass, 'w-[60px]')}>Chg.wt*</TableHead>
                <TableHead className={cn(thClass, 'w-[60px]')}>Rate</TableHead>
                <TableHead className={cn(thClass, 'w-[100px]')}>Freight ON</TableHead>
                <TableHead className={cn(thClass, 'w-[100px]')}>Lumpsum</TableHead>
                <TableHead className={cn(thClass, 'w-[120px]')}>Pvt.Mark</TableHead>
                <TableHead className={cn(thClass, 'w-[120px]')}>Invoice No</TableHead>
                <TableHead className={cn(thClass, 'w-[100px]')}>D.Value</TableHead>
                <TableHead className={cn(thClass, 'w-[40px]')}>Del</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
                    <TableCell className={`${tdClass} text-center font-semibold text-red-500`}>{index + 1}*</TableCell>
                    <TableCell className={tdClass}><Input type="text" placeholder="E-Way Bill No" className={inputClass} value={row.ewbNo} onChange={(e) => handleInputChange(index, 'ewbNo', e.target.value)} readOnly={isViewOnly} /></TableCell>
                    <TableCell className={tdClass}>
                        <Combobox options={uppercaseItemOptions} value={row.itemName} onChange={(val) => handleInputChange(index, 'itemName', val)} placeholder="Search item..." searchPlaceholder="Search items..." notFoundMessage="No item found." addMessage="Add New Item" onAdd={handleOpenAddItem} disabled={isViewOnly} />
                    </TableCell>
                    <TableCell className={tdClass}><Input type="text" placeholder="type description" className={inputClass} value={row.description} onChange={(e) => handleInputChange(index, 'description', e.target.value)} readOnly={isViewOnly} /></TableCell>
                    <TableCell className={tdClass}><Input type="text" inputMode="decimal" className={inputClass} value={row.wtPerUnit} onChange={(e) => handleInputChange(index, 'wtPerUnit', e.target.value)} readOnly={isViewOnly} /></TableCell>
                    <TableCell className={tdClass}><Input type="text" inputMode="decimal" className={inputClass} value={row.qty} onChange={(e) => handleInputChange(index, 'qty', e.target.value)} readOnly={isViewOnly} /></TableCell>
                    <TableCell className={tdClass}><Input type="text" inputMode="decimal" className={cn(inputClass, 'bg-muted')} value={row.actWt} readOnly /></TableCell>
                    <TableCell className={tdClass}><Input type="text" ref={el => inputRefs.current[`chgWt-${row.id}`] = el} inputMode="decimal" className={inputClass} value={row.chgWt} onChange={(e) => handleInputChange(index, 'chgWt', e.target.value)} onBlur={() => handleChgWtBlur(index)} readOnly={isViewOnly} /></TableCell>
                    <TableCell className={tdClass}><Input type="text" ref={el => inputRefs.current[`rate-${row.id}`] = el} inputMode="decimal" className={inputClass} value={row.rate} onChange={(e) => handleInputChange(index, 'rate', e.target.value)} readOnly={row.freightOn === 'Fixed' || isViewOnly} /></TableCell>
                    <TableCell className={tdClass}><Select value={row.freightOn} onValueChange={(val) => handleInputChange(index, 'freightOn', val)} disabled={isViewOnly}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Act.wt">Act.wt</SelectItem><SelectItem value="Chg.wt">Chg.wt</SelectItem><SelectItem value="Fixed">Fixed</SelectItem><SelectItem value="Quantity">Quantity</SelectItem></SelectContent></Select></TableCell>
                    <TableCell className={tdClass}><Input type="text" inputMode="decimal" className={inputClass} value={row.lumpsum} onChange={(e) => handleInputChange(index, 'lumpsum', e.target.value)} readOnly={row.freightOn !== 'Fixed' || isViewOnly} /></TableCell>
                    <TableCell className={tdClass}><Input type="text" placeholder="Private Mark" className={inputClass} value={row.pvtMark} onChange={(e) => handleInputChange(index, 'pvtMark', e.target.value)} readOnly={isViewOnly} /></TableCell>
                    <TableCell className={tdClass}><Input type="text" placeholder="Invoice No" className={inputClass} value={row.invoiceNo} onChange={(e) => handleInputChange(index, 'invoiceNo', e.target.value)} readOnly={isViewOnly} /></TableCell>
                    <TableCell className={tdClass}><Input type="text" inputMode="decimal" placeholder="Declared Value" className={inputClass} value={row.dValue} onChange={(e) => handleInputChange(index, 'dValue', e.target.value)} readOnly={isViewOnly} /></TableCell>
                    <TableCell className={`${tdClass} text-center`}>
                        {!isViewOnly && <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={rows.length <= 1}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this item row.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeRow(row.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>}
                    </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFooter>
              <TableRow>
                <TableCell className={`${tfClass} text-right`} colSpan={5}>
                    <span>TOTAL ITEM: {totals.itemCount}</span>
                </TableCell>
                <TableCell className={`${tfClass} text-center`}>{totals.qty}</TableCell>
                <TableCell className={`${tfClass} text-center`}>{totals.actWt.toFixed(2)}</TableCell>
                <TableCell className={`${tfClass} text-center`}>{totals.chgWt.toFixed(2)}</TableCell>
                <TableCell colSpan={7} className={tfClass}>
                    <div className="flex justify-end">
                        {!isViewOnly && <Button variant="ghost" size="icon" onClick={addRow} className="h-6 w-6 text-blue-600">
                            <PlusCircle className="h-5 w-5" />
                        </Button>}
                    </div>
                </TableCell>
              </TableRow>
          </TableFooter>
        </Table>
      </div>
      <AddItemDialog
        isOpen={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        onSave={handleSaveItem}
        item={initialItemData}
      />
      <AlertDialog open={!!weightWarning} onOpenChange={(open) => {
          if (!open && weightWarning) {
              handleWeightWarningCancel();
          }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weight Mismatch Warning</AlertDialogTitle>
            <AlertDialogDescription>
              Chargeable weight is less than actual weight. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleWeightWarningConfirm}>Continue Anyway</AlertDialogAction>
            <AlertDialogCancel onClick={handleWeightWarningCancel}>Correct Weight</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientOnly>
  );
}
