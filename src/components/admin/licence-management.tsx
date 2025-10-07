
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LicenceType } from '@/lib/licence-data';
import { getLicenceTypes, saveLicenceTypes } from '@/lib/licence-data';
import { Label } from '../ui/label';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";

export function LicenceManagement() {
  const [licenceTypes, setLicenceTypes] = useState<LicenceType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLicence, setCurrentLicence] = useState<Partial<LicenceType> | null>(null);
  const [name, setName] = useState('');
  const [fee, setFee] = useState<number | ''>('');
  const { toast } = useToast();

  useEffect(() => {
    setLicenceTypes(getLicenceTypes());
  }, []);

  const handleOpenDialog = (licence?: LicenceType) => {
    setCurrentLicence(licence || null);
    setName(licence?.name || '');
    setFee(licence?.fee || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedLicences = licenceTypes.filter(licence => licence.id !== id);
    saveLicenceTypes(updatedLicences);
    setLicenceTypes(updatedLicences);
    toast({
      title: 'Licence Type Deleted',
      variant: 'destructive',
    });
  };

  const handleSave = () => {
    if (!name.trim() || fee === '') {
        toast({ title: 'Validation Error', description: 'Name and Fee are required.', variant: 'destructive'});
        return;
    }
    
    let updatedLicences;
    if (currentLicence && currentLicence.id) {
      updatedLicences = licenceTypes.map(lt => 
        lt.id === currentLicence.id ? { ...lt, name, fee: Number(fee) } : lt
      );
      toast({ title: 'Licence Type Updated' });
    } else {
      const newLicence: LicenceType = {
        id: `licence-${Date.now()}`,
        name,
        fee: Number(fee),
      };
      updatedLicences = [...licenceTypes, newLicence];
      toast({ title: 'Licence Type Added' });
    }
    saveLicenceTypes(updatedLicences);
    setLicenceTypes(updatedLicences);
    setIsDialogOpen(false);
  };


  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Manage Licence Types and Fees</CardTitle>
                 <div className="flex justify-end">
                    <Button onClick={() => handleOpenDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Licence
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>Licence Name</TableHead>
                            <TableHead className={thClass}>Fee</TableHead>
                            <TableHead className={`${thClass} text-right`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {licenceTypes.map((licence) => (
                        <TableRow key={licence.id}>
                            <TableCell className="font-medium">{licence.name}</TableCell>
                            <TableCell>{licence.fee.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(licence)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(licence.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{currentLicence ? 'Edit Licence' : 'Add New Licence'}</DialogTitle>
                </DialogHeader>
                 <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="licence-name">Licence Name</Label>
                        <Input id="licence-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="licence-fee">Fee</Label>
                        <Input id="licence-fee" type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
                    </div>
                 </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
