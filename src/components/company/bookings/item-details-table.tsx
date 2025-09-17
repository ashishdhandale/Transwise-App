
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

const createEmptyRow = (id: number): ItemRow => ({
    id,
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
  const { toast } = useToast();

  const loadItems = useCallback(() => {
    try {
        const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
        if (savedItems) {
            setItemOptions(JSON.parse(savedItems));
        } else {
            // If nothing in storage, you might want to set some defaults
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
    if (!isClient) return;

    try {
      const savedBookingSettings = localStorage.getItem(BOOKING_SETTINGS_KEY);
      if (savedBookingSettings) {
        const parsed = JSON.parse(savedBookingSettings);
        if (parsed.defaultItemRows && typeof parsed.defaultItemRows === 'number') {
            if (rows.length < parsed.defaultItemRows) {
                const newRows = Array.from({ length: parsed.defaultItemRows - rows.length }, (_, i) => createEmptyRow(Date.now() + i));
                onRowsChange([...rows, ...newRows]);
            }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

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
            // For 'Fixed', the lumpsum is manually entered, so we don't calculate it here.
            // We just return what's already there.
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


  const handleInputChange = (rowIndex: number, columnId: string, value: any) => {
    const newRows = [...rows];
    const newRow = { ...newRows[rowIndex], [columnId]: value };

    if (columnId === 'freightOn') {
        if (value === 'Fixed') {
            newRow.rate = '0'; // Set rate to 0 when 'Fixed' is chosen
            newRow.lumpsum = ''; // Clear lumpsum for manual entry
        } else {
             // If switching away from fixed, recalculate lumpsum based on current values
            const recalulatedLumpsum = calculateLumpsum(newRow);
            newRow.lumpsum = recalulatedLumpsum > 0 ? recalulatedLumpsum.toString() : '';
        }
    }
    
    if (columnId === 'itemName') {
        const selectedItem = itemOptions.find(item => item.name === value);
        if (selectedItem && selectedItem.description) {
            newRow.description = selectedItem.description;
        }
    }
    
    newRows[rowIndex] = newRow;
    onRowsChange(newRows);
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

  const getInputForColumn = (columnId: string, index: number) => {
    const row = rows[index];
    if (!row) return null;
    
    const value = row[columnId] ?? '';
    const isFixedFreight = row.freightOn === 'Fixed';

    switch(columnId) {
        case 'ewbNo':
            return <Input type="text" className={inputClass} maxLength={12} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} />;
        case 'itemName':
            return (
                 <Combobox
                    options={itemOptions.map(i => ({ label: i.name, value: i.name }))}
                    value={value}
                    onChange={(val) => handleInputChange(index, columnId, val)}
                    placeholder="Select item..."
                    searchPlaceholder="Search items..."
                    notFoundMessage="No item found."
                    addMessage="Add New Item"
                    onAdd={() => setIsAddItemOpen(true)}
                />
            );
        case 'description':
            return <Input type="text" placeholder="type description" className={inputClass} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} />;
        case 'freightOn':
            return (
                <Select value={value} onValueChange={(val) => handleInputChange(index, columnId, val)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Act.wt">Act.wt</SelectItem>
                        <SelectItem value="Chg.wt">Chg.wt</SelectItem>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Quantity">Quantity</SelectItem>
                    </SelectContent>
                </Select>
            );
        case 'rate':
            return <Input type="text" inputMode="decimal" pattern="[0-9.]*" className={inputClass} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} readOnly={isFixedFreight} />;
        case 'lumpsum':
             return <Input type="text" inputMode="decimal" pattern="[0-9.]*" className={inputClass} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} readOnly={!isFixedFreight} />;
        case 'dValue':
            return <Input type="text" inputMode="decimal" pattern="[0-9.]*" className={inputClass} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} />;
        case 'qty':
             return <Input type="text" inputMode="decimal" pattern="[0-9.]*" className={inputClass} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} />;
        case 'actWt':
        case 'chgWt':
             return <Input type="text" inputMode="decimal" pattern="[0-9.]*" className={inputClass} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} />;
        case 'pvtMark':
        case 'invoiceNo':
            return <Input type="text" className={inputClass} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} />;
        default: // For custom columns
            return <Input type="text" className={inputClass} value={value} onChange={(e) => handleInputChange(index, columnId, e.target.value)} />;
    }
  }


  const addRow = () => {
    onRowsChange([...rows, createEmptyRow(Date.now())]);
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
    );
  }

  const visibleColumns = columns.filter(c => c.isVisible);
  
  const visibleColIds = visibleColumns.map(c => c.id);

  const getColSpan = (targetColId: string) => {
    const targetIndex = visibleColIds.indexOf(targetColId);
    if (targetIndex === -1) return 1;

    let span = 1;
    for (let i = targetIndex - 1; i >= 0; i--) {
        const currentColId = visibleColIds[i];
        if (['qty', 'actWt', 'chgWt'].includes(currentColId)) {
            break;
        }
        span++;
    }
    return span;
  }
  
  return (
    <>
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
                <TableCell className={`${tdClass} text-center font-semibold text-red-500 whitespace-nowrap`}>{index + 1}*</TableCell>
                {visibleColumns.map(col => (
                  <TableCell key={`${row.id}-${col.id}`} className={tdClass}>
                    {getInputForColumn(col.id, index)}
                  </TableCell>
                ))}
                <TableCell className={`${tdClass} text-center`}>
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
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className={`${tfClass} text-right`} colSpan={getColSpan('qty')}>
                <div className="flex items-center justify-end gap-2">
                    <span>TOTAL ITEM: {totals.itemCount}</span>
                     <Button variant="ghost" size="icon" onClick={addRow} className="h-6 w-6 text-blue-600">
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                </div>
              </TableCell>
              
              {['qty', 'actWt', 'chgWt'].map(id => {
                if (visibleColIds.includes(id)) {
                  switch(id) {
                    case 'qty': return <TableCell key="total-qty" className={`${tfClass} text-center`}>{totals.qty}</TableCell>;
                    case 'actWt': return <TableCell key="total-actWt" className={`${tfClass} text-center`}>{totals.actWt}</TableCell>;
                    case 'chgWt': return <TableCell key="total-chgWt" className={`${tfClass} text-center`}>{totals.chgWt}</TableCell>;
                  }
                }
                return null;
              })}

              <TableCell colSpan={visibleColIds.filter(id => !['qty', 'actWt', 'chgWt'].includes(id)).length - getColSpan('qty') + 3} className={tfClass}></TableCell>

            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <AddItemDialog
        isOpen={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        onSave={handleSaveItem}
        item={null}
      />
    </>
  );
}
