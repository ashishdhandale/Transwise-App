
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
  CommandInput,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ClientOnly } from "./client-only"
import { Input } from "./input"

type ComboboxOption = { label: string; value: string };
type ComboboxOptionGroup = { groupLabel: string; options: ComboboxOption[] };

interface ComboboxProps {
    options: (ComboboxOption | ComboboxOptionGroup)[];
    value?: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundMessage?: string;
    addMessage?: string;
    onAdd?: (query?: string) => void;
    disabled?: boolean;
}

const isGroup = (option: ComboboxOption | ComboboxOptionGroup): option is ComboboxOptionGroup => {
    return 'groupLabel' in option;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(({
    options,
    value,
    onChange,
    onBlur,
    placeholder = "Select an option...",
    searchPlaceholder = "Search...",
    notFoundMessage = "No option found.",
    addMessage = "Add new",
    onAdd,
    disabled = false,
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [popoverWidth, setPopoverWidth] = React.useState(0);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (triggerRef.current) {
        setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }, []);

  const allOptions = React.useMemo(() =>
    options.flatMap(opt => isGroup(opt) ? opt.options : [opt]),
  [options]);
  
  const displayValue = allOptions.find(option => option.value.toLowerCase() === value?.toLowerCase())?.label || value;

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setInputValue('');
    setOpen(false);
  }

  const handleAdd = () => {
    if (onAdd) {
        setOpen(false);
        onAdd(inputValue || value);
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const typedValue = e.target.value;
      setInputValue(typedValue);
      onChange(typedValue); // Update form value as user types
      if (!open) {
          setOpen(true);
      }
  }

  const handleClear = () => {
      onChange('');
      setInputValue('');
  };


  return (
    <ClientOnly>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative" ref={triggerRef}>
          <PopoverTrigger asChild>
             <Input
                ref={ref}
                type="text"
                placeholder={placeholder}
                value={inputValue || displayValue || ''}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                disabled={disabled}
                className="w-full pr-10"
             />
          </PopoverTrigger>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {value && !disabled && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClear} type="button">
                    <X className="h-4 w-4 text-muted-foreground" />
                </Button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </div>
        <PopoverContent 
            style={{ width: popoverWidth }}
            className="p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
             <CommandList>
              <CommandEmpty>
                  <div className="py-4 text-center text-sm">
                      <p>{notFoundMessage}</p>
                      {onAdd && (
                          <Button variant="link" size="sm" className="mt-2" onClick={handleAdd}>
                              <PlusCircle className="mr-2 h-4 w-4"/>
                              {addMessage} "{inputValue || value}"
                          </Button>
                      )}
                  </div>
              </CommandEmpty>
              {options.map((option, index) => (
                  <CommandGroup
                    key={isGroup(option) ? option.groupLabel : `group-${index}`}
                    heading={isGroup(option) ? option.groupLabel : undefined}
                  >
                    {(isGroup(option) ? option.options : [option]).filter(item => item.label.toLowerCase().includes(inputValue.toLowerCase())).map(item => (
                       <CommandItem
                            key={item.value}
                            value={item.label}
                            onSelect={() => handleSelect(item.value)}
                        >
                            <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                value?.toLowerCase() === item.value.toLowerCase() ? "opacity-100" : "opacity-0"
                            )}
                            />
                            {item.label}
                        </CommandItem>
                    ))}
                  </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ClientOnly>
  )
});
Combobox.displayName = "Combobox";
