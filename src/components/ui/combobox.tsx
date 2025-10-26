
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

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(({
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
  const triggerRef = React.useRef<HTMLButtonElement>(null);

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
    onChange(currentValue === value ? "" : currentValue);
    setInputValue('');
    setOpen(false);
  }

  const handleAdd = () => {
    if (onAdd) {
        setOpen(false);
        onAdd(inputValue || value);
    }
  }

  return (
    <ClientOnly>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
           <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            >
            <span className="truncate">{value ? allOptions.find((option) => option.value === value)?.label : placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent 
            style={{ width: popoverWidth }}
            className="p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
             <CommandInput 
                placeholder={searchPlaceholder} 
                value={inputValue} 
                onValueChange={setInputValue}
            />
             <CommandList>
              <CommandEmpty>
                  <div className="py-4 text-center text-sm">
                      <p>{notFoundMessage}</p>
                      {onAdd && (
                          <Button variant="link" size="sm" className="mt-2" onClick={handleAdd}>
                              <PlusCircle className="mr-2 h-4 w-4"/>
                              {addMessage} "{inputValue}"
                          </Button>
                      )}
                  </div>
              </CommandEmpty>
              {options.map((option, index) => (
                  <CommandGroup
                    key={isGroup(option) ? option.groupLabel : `group-${index}`}
                    heading={isGroup(option) ? option.groupLabel : undefined}
                  >
                    {(isGroup(option) ? option.options : [option]).map(item => (
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
