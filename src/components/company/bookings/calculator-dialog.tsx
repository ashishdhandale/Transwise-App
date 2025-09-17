
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CalculatorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CalculatorDialog({ isOpen, onOpenChange }: CalculatorDialogProps) {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(true);

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
      case '/': return firstOperand / secondOperand;
      case '=': return secondOperand;
      default: return secondOperand;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);
    if (operator && currentValue !== null) {
      const result = calculate(currentValue, inputValue, operator);
      setCurrentValue(result);
      setDisplay(String(result));
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
                variant="outline"
                className="h-14 text-xl"
                onClick={() => handleButtonClick(btn)}
              >
                {btn}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
