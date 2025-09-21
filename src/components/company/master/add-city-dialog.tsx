
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { City } from '@/lib/types';

interface AddCityDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (cityData: Omit<City, 'id'>) => boolean;
    city?: Partial<City> | null;
}

export function AddCityDialog({ isOpen, onOpenChange, onSave, city }: AddCityDialogProps) {
    const [cityName, setCityName] = useState('');
    const [aliasCode, setAliasCode] = useState('');
    const [pinCode, setPinCode] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (city) {
            setCityName(city.name || '');
            setAliasCode(city.aliasCode || '');
            setPinCode(city.pinCode || '');
        } else {
            setCityName('');
            setAliasCode('');
            setPinCode('');
        }
    }, [city, isOpen]);


    const handleSave = () => {
        if (!cityName.trim() || !aliasCode.trim() || !pinCode.trim()) {
            toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' });
            return;
        }

        const success = onSave({
            name: cityName.toUpperCase(),
            aliasCode: aliasCode.toUpperCase(),
            pinCode,
        });

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{city && 'id' in city ? 'Edit City' : 'Add New City'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="city-name">City Name</Label>
                        <Input
                            id="city-name"
                            placeholder="Enter city name"
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value.toUpperCase())}
                            autoFocus
                        />
                    </div>
                    <div>
                        <Label htmlFor="alias-code">Alias Code</Label>
                        <Input
                            id="alias-code"
                            placeholder="Enter alias code (e.g., NGP)"
                            value={aliasCode}
                            onChange={(e) => setAliasCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div>
                        <Label htmlFor="pin-code">Pin Code</Label>
                        <Input
                            id="pin-code"
                            placeholder="Enter 6-digit pin code"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            maxLength={6}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
