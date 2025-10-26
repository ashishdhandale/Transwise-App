
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
        setPopoverWidth(inputRef.current.offsetWidth);
    }
  }, []);

  const allOptions = React.useMemo(() =>
    options.flatMap(opt => isGroup(opt) ? opt.options : [opt]),
  [options]);
  
  const displayValue = allOptions.find(option => option.value.toLowerCase() === value?.toLowerCase())?.label || value || '';

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
  }

  const handleAdd = () => {
    if (onAdd) {
        setOpen(false);
        onAdd(inputValue);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (!open) {
      setOpen(true);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      inputRef.current?.focus();
  }

  return (
    <ClientOnly>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
            <PopoverTrigger asChild>
                <Input
                    ref={inputRef}
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className="pr-10"
                    disabled={disabled}
                    autoComplete="off"
                />
            </PopoverTrigger>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                 {value && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={handleClear}
                        aria-label="Clear"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                <ChevronsUpDown 
                    className="h-4 w-4 shrink-0 opacity-50 cursor-pointer"
                    onClick={() => {
                        if (!open) setOpen(true);
                        inputRef.current?.focus();
                    }}
                 />
            </div>
        </div>
        <PopoverContent 
            style={{ width: popoverWidth }}
            className="p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command filter={(value, search) => {
              const extendedValue = allOptions.find(o => o.label.toLowerCase() === value.toLowerCase())?.value || value;
              if (extendedValue.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
          }}>
             <CommandInput 
                value={value}
                onValueChange={onChange}
                placeholder={searchPlaceholder}
            />
             <CommandList>
              <CommandEmpty>
                  <div className="py-4 text-center text-sm">
                      <p>{notFoundMessage}</p>
                      {onAdd && (
                          <Button variant="link" size="sm" className="mt-2" onClick={handleAdd}>
                              <PlusCircle className="mr-2 h-4 w-4"/>
                              {addMessage} "{value}"
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
