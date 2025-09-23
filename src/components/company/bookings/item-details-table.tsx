

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
import type { ColumnSetting } from '@/components/company/settings/item-details-settings';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';
import type { Item } from '@/lib/types';
import { AddItemDialog } from '../master/add-item-dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';


export interface ItemRow {
  id: number;
  ewbNo: string;
  itemName: string;
  description: string;
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

const thClass = "p-1.5 h-9 bg-primary/10 text-primary font-semibold text-xs text-center";
const tdClass = "p-1";
const tfClass = "p-1.5 h-9 bg-primary/10 text-primary font-bold text-xs";
const inputClass = "h-8 text-xs px-1";

const BOOKING_SETTINGS_KEY = 'transwise_booking_settings';
const ITEM_DETAILS_SETTINGS_KEY = 'transwise_item_details_settings';
const LOCAL_STORAGE_KEY_ITEMS = 'transwise_items';
const DEFAULT_ROWS = 2;
const DEFAULT_ITEM_NAME = 'Frm MAS';

const defaultColumns: ColumnSetting[] = [
    { id: 'ewbNo', label: 'EWB no.', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[220px]' },
    { id: 'itemName', label: 'Item Name*', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[160px]' },
    { id: 'description', label: 'Description*', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[220px]' },
    { id: 'qty', label: 'Qty*', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[100px]' },
    { id: 'actWt', label: 'Act.wt*', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[100px]' },
    { id: 'chgWt', label: 'Chg.wt*', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[100px]' },
    { id: 'rate', label: 'Rate', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[100px]' },
    { id: 'freightOn', label: 'Freight ON', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[130px]' },
    { id: 'lumpsum', label: 'Lumpsum', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[120px]' },
    { id: 'pvtMark', label: 'Pvt.Mark', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[140px]' },
    { id: 'invoiceNo', label: 'Invoice No', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[140px]' },
    { id: 'dValue', label: 'D.Value', isVisible: true, isCustom: false, isRemovable: false, width: 'min-w-[140px]' },
];

let nextId = 1;
const createEmptyRow = (): ItemRow => ({
    id: nextId++,
    ewbNo: '',
    itemName: DEFAULT_ITEM_NAME,
    description: '',
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
}

export function ItemDetailsTable({ rows, onRowsChange }: ItemDetailsTableProps) {
  const [columns, setColumns] = useState<ColumnSetting[]>(defaultColumns);
  const [isClient, setIsClient] = useState(false);
  const [itemOptions, setItemOptions] = useState<Item[]>([]);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [initialItemData, setInitialItemData] = useState<Partial<Item> | null>(null);
  const [weightWarning, setWeightWarning] = useState<{ rowIndex: number; value: string } | null>(null);
  const [nextFocusRef, setNextFocusRef] = useState<React.RefObject<HTMLInputElement> | null>(null);
  const { toast } = useToast();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const loadItems = useCallback(() => {
    try {
        const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
        if (savedItems) {
            setItemOptions(JSON.parse(savedItems));
        } else {
            const defaultItems: Item[] = [
                { id: 1, name: 'Frm MAS', hsnCode: '', description: '' },
                { id: 2, name: 'Electronics', hsnCode: '', description: '' },
            ];
            setItemOptions(defaultItems);
            localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(defaultItems));
        }
    } catch (error) {
        console.error("Failed to load item options", error);
    }
  }, []);
  
  useEffect(() => {
    setIsClient(true);
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!isClient || rows.length > 0) return;

    try {
      const savedBookingSettings = localStorage.getItem(BOOKING_SETTINGS_KEY);
      let defaultRowCount = DEFAULT_ROWS;
      if (savedBookingSettings) {
        const parsed = JSON.parse(savedBookingSettings);
        if (parsed.defaultItemRows && typeof parsed.defaultItemRows === 'number') {
            defaultRowCount = parsed.defaultItemRows;
        }
      }
      
      const newRows = Array.from({ length: defaultRowCount }, () => createEmptyRow());
      onRowsChange(newRows);
      
      const savedItemDetailsSettings = localStorage.getItem(ITEM_DETAILS_SETTINGS_KEY);
      if (savedItemDetailsSettings) {
          const parsed = JSON.parse(savedItemDetailsSettings);
          if (parsed.columns) {
              setColumns(parsed.columns);
          }
      }

    } catch (error) {
      console.error("Could not load settings, using defaults.", error);
      const newRows = Array.from({ length: DEFAULT_ROWS }, () => createEmptyRow());
      onRowsChange(newRows);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

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
    const newRow = { ...newRows[rowIndex] };
    
    let processedValue = value;
    
    newRow[columnId] = processedValue;

    if (columnId === 'actWt') {
        newRow.chgWt = processedValue;
        newRow.freightOn = 'Act.wt';
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
    
    if (columnId === 'itemName') {
        const selectedItem = itemOptions.find(item => item.name.toLowerCase() === value.toLowerCase());
        if (selectedItem && selectedItem.description) {
            newRow.description = selectedItem.description;
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
        } else if (chgWt > actWt) {
            updateRow(rowIndex, { freightOn: 'Chg.wt' });
        } else {
            updateRow(rowIndex, { freightOn: 'Act.wt' });
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
            localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(updatedItems));
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
      const filledRows = rows.filter(row => row.itemName !== DEFAULT_ITEM_NAME || parseFloat(row.qty) > 0 || parseFloat(row.actWt) > 0);
      return {
          itemCount: filledRows.length,
          qty: rows.reduce((sum, row) => sum + (parseFloat(row.qty) || 0), 0),
          actWt: rows.reduce((sum, row) => sum + (parseFloat(row.actWt) || 0), 0),
          chgWt: rows.reduce((sum, row) => sum + (parseFloat(row.chgWt) || 0), 0),
      }
  }, [rows]);

  if (!isClient) {
    return (
        <div className="border rounded-md">
            <Table>
            <TableBody>
                <TableRow>
                    <TableCell>
                        <div className="h-20 bg-muted rounded-md animate-pulse"></div>
                    </TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
              <TableRow>
                <TableHead className={`${thClass} w-[5%]`}>#</TableHead>
                <TableHead className={`${thClass} w-[15%]`}>Item Name*</TableHead>
                <TableHead className={`${thClass} w-[20%]`}>Description*</TableHead>
                <TableHead className={`${thClass} w-[10%]`}>Qty*</TableHead>
                <TableHead className={`${thClass} w-[10%]`}>Act.wt*</TableHead>
                <TableHead className={`${thClass} w-[10%]`}>Chg.wt*</TableHead>
                <TableHead className={`${thClass} w-[10%]`}>Rate</TableHead>
                <TableHead className={`${thClass} w-[15%]`}>Freight ON</TableHead>
                <TableHead className={`${thClass} w-[10%]`}>Lumpsum</TableHead>
                <TableHead className={`${thClass} w-[5%]`}>Del</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {rows.map((row, index) => (
              <React.Fragment key={row.id}>
                <TableRow>
                    <TableCell className={`${tdClass} text-center font-semibold text-red-500`} rowSpan={2}>{index + 1}*</TableCell>
                    <TableCell className={tdClass}>
                        <Combobox
                            options={uppercaseItemOptions}
                            value={row.itemName}
                            onChange={(val) => handleInputChange(index, 'itemName', val)}
                            placeholder="Select item..."
                            searchPlaceholder="Search items..."
                            notFoundMessage="No item found."
                            addMessage="Add New Item"
                            onAdd={handleOpenAddItem}
                        />
                    </TableCell>
                    <TableCell className={tdClass}>
                        <Input type="text" placeholder="type description" className={inputClass} value={row.description} onChange={(e) => handleInputChange(index, 'description', e.target.value)} />
                    </TableCell>
                    <TableCell className={tdClass}>
                        <Input type="text" inputMode="decimal" className={inputClass} value={row.qty} onChange={(e) => handleInputChange(index, 'qty', e.target.value)} />
                    </TableCell>
                    <TableCell className={tdClass}>
                        <Input type="text" inputMode="decimal" className={inputClass} value={row.actWt} onChange={(e) => handleInputChange(index, 'actWt', e.target.value)} />
                    </TableCell>
                    <TableCell className={tdClass}>
                        <Input type="text" ref={el => inputRefs.current[`chgWt-${row.id}`] = el} inputMode="decimal" className={inputClass} value={row.chgWt} onChange={(e) => handleInputChange(index, 'chgWt', e.target.value)} onBlur={() => handleChgWtBlur(index)} />
                    </TableCell>
                    <TableCell className={tdClass}>
                        <Input type="text" ref={el => inputRefs.current[`rate-${row.id}`] = el} inputMode="decimal" className={inputClass} value={row.rate} onChange={(e) => handleInputChange(index, 'rate', e.target.value)} readOnly={row.freightOn === 'Fixed'} />
                    </TableCell>
                    <TableCell className={tdClass}>
                       <Select value={row.freightOn} onValueChange={(val) => handleInputChange(index, 'freightOn', val)}>
                            <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Act.wt">Act.wt</SelectItem>
                                <SelectItem value="Chg.wt">Chg.wt</SelectItem>
                                <SelectItem value="Fixed">Fixed</SelectItem>
                                <SelectItem value="Quantity">Quantity</SelectItem>
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell className={tdClass}>
                         <Input type="text" inputMode="decimal" className={inputClass} value={row.lumpsum} onChange={(e) => handleInputChange(index, 'lumpsum', e.target.value)} readOnly={row.freightOn !== 'Fixed'} />
                    </TableCell>
                    <TableCell className={`${tdClass} text-center`} rowSpan={2}>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={rows.length <= 1}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the item row from the booking.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeRow(row.id)}>
                              Delete
                              </AlertDialogAction>
                          </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className={tdClass} colSpan={4}>
                         <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">EWB No:</Label>
                            <Input type="text" className={inputClass} maxLength={12} value={row.ewbNo} onChange={(e) => handleInputChange(index, 'ewbNo', e.target.value)} />
                        </div>
                    </TableCell>
                    <TableCell className={tdClass} colSpan={2}>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">Invoice No:</Label>
                            <Input type="text" className={inputClass} value={row.invoiceNo} onChange={(e) => handleInputChange(index, 'invoiceNo', e.target.value)} />
                        </div>
                    </TableCell>
                    <TableCell className={tdClass} colSpan={2}>
                         <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">D.Value:</Label>
                            <Input type="text" inputMode="decimal" className={inputClass} value={row.dValue} onChange={(e) => handleInputChange(index, 'dValue', e.target.value)} />
                        </div>
                    </TableCell>
                </TableRow>
              </React.Fragment>
              ))}
          </TableBody>
          <TableFooter>
              <TableRow>
                <TableCell className={`${tfClass} text-right`} colSpan={3}>
                    <span>TOTAL ITEM: {totals.itemCount}</span>
                </TableCell>
                <TableCell className={`${tfClass} text-center`}>{totals.qty}</TableCell>
                <TableCell className={`${tfClass} text-center`}>{totals.actWt}</TableCell>
                <TableCell className={`${tfClass} text-center`}>{totals.chgWt}</TableCell>
                <TableCell colSpan={4} className={tfClass}>
                    <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={addRow} className="h-6 w-6 text-blue-600">
                            <PlusCircle className="h-5 w-5" />
                        </Button>
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
    </>
  );
}
