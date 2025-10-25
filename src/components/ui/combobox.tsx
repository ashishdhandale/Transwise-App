
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

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
    autoOpenOnFocus?: boolean;
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
    autoOpenOnFocus = false,
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    onChange(newValue);
    setInputValue('');
    setOpen(false);
    if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
    }
  }

  const handleAdd = () => {
    if (onAdd) {
        setOpen(false); // Close the popover first
        onAdd(inputValue);
    }
  }

  const allOptions = React.useMemo(() =>
    options.flatMap(opt => isGroup(opt) ? opt.options : [opt]),
  [options]);

  const displayValue = allOptions.find(option => option.value.toLowerCase() === value?.toLowerCase())?.label || value;

  const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
          if (onBlur) onBlur();
          setInputValue('');
      }
  }
  
  const handleTriggerFocus = () => {
      if (autoOpenOnFocus) {
          setOpen(true);
      }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
          if (ref && 'current' in ref && ref.current) {
            ref.current.focus();
          }
      }
  };


  return (
    <ClientOnly>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            onFocus={handleTriggerFocus}
          >
            <span className="truncate">
              {displayValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          onKeyDown={handleKeyDown}
        >
          <Command>
            <CommandInput
              ref={inputRef}
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
