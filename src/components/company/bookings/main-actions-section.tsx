
'use client';

import { Button } from '@/components/ui/button';
import { Save, Ban, ListRestart, FileUp, Calculator } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { CalculatorDialog } from './calculator-dialog';

export function MainActionsSection() {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <Button className="bg-green-600 hover:bg-green-700"><Save className="mr-2 h-4 w-4" /> Save Booking</Button>
            <Button variant="destructive"><Ban className="mr-2 h-4 w-4" />Cancel Booking</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline"><ListRestart className="mr-2 h-4 w-4" />Reset Form</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will reset all fields in the form to their default values. Any unsaved changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline"><FileUp className="mr-2 h-4 w-4" />Export</Button>
            <Button variant="outline" onClick={() => setIsCalculatorOpen(true)}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculator
            </Button>
            <CalculatorDialog isOpen={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
        </div>
    );
}
