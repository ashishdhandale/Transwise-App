
'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CalculatorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialValue?: string;
  onConfirm: (value: string) => void;
}

export function CalculatorDialog({ isOpen, onOpenChange, initialValue = '0', onConfirm }: CalculatorDialogProps) {
  const [display, setDisplay] = useState(initialValue);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
        setDisplay(initialValue);
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(true);
    }
  }, [isOpen, initialValue]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setCurrentValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (currentValue === null) {
      setCurrentValue(inputValue);
    } else if (operator) {
      const result = calculate(currentValue, inputValue, operator);
      setCurrentValue(result);
      setDisplay(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };
  
  const calculate = (firstOperand: number, secondOperand: number, operator: string) => {
    switch (operator) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '*': return firstOperand * secondOperand;
      case '/': return secondOperand === 0 ? NaN : firstOperand / secondOperand; // Handle division by zero
      case '=': return secondOperand;
      default: return secondOperand;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);
    if (operator && currentValue !== null) {
      const result = calculate(currentValue, inputValue, operator);
      if (isNaN(result)) {
        setDisplay('Error');
      } else {
        setCurrentValue(result);
        setDisplay(String(result));
      }
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
  ];

  const handleButtonClick = (btn: string) => {
     if (display === 'Error') {
        clearDisplay();
     }
    if (btn >= '0' && btn <= '9') {
      inputDigit(btn);
    } else if (btn === '.') {
      inputDecimal();
    } else if (btn === '=') {
      handleEquals();
    } else {
      performOperation(btn);
    }
  };
  
  const handleConfirm = () => {
      if (display !== 'Error') {
          onConfirm(display);
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Calculator</DialogTitle>
        </DialogHeader>
        <div className="p-2 space-y-2 bg-muted rounded-md">
          <Input 
            value={display} 
            readOnly 
            className="h-14 text-right text-3xl font-mono bg-background" 
          />
          <div className="grid grid-cols-4 gap-2">
            <Button 
                variant="destructive"
                className="col-span-4" 
                onClick={clearDisplay}
            >
                C
            </Button>
            {buttons.map((btn) => (
              <Button
                key={btn}
                variant={['/', '*', '-', '+', '='].includes(btn) ? 'secondary' : 'outline'}
                className="h-14 text-xl"
                onClick={() => handleButtonClick(btn)}
              >
                {btn}
              </Button>
            ))}
          </div>
        </div>
         <DialogFooter>
          <Button onClick={handleConfirm} className="w-full">
            Confirm & Use Value
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
