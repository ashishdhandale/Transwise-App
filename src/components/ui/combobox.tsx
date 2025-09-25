
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ClientOnly } from "./client-only"

interface ComboboxProps {
    options: { label: string; value: string }[];
    value?: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundMessage?: string;
    addMessage?: string;
    onAdd?: (query?: string) => void;
    disabled?: boolean;
    allowFreeform?: boolean;
    onFreeformChange?: (value: string) => void;
    autoOpenOnFocus?: boolean;
}

export function Combobox({ 
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
    allowFreeform = false,
    onFreeformChange,
    autoOpenOnFocus = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);


  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue);
    setSearchQuery('');
    setOpen(false);
  }
  
  const handleInputChange = (query: string) => {
      setSearchQuery(query);
      if (allowFreeform && onFreeformChange) {
          onFreeformChange(query);
      }
  }

  const handleAdd = () => {
    if (onAdd) {
        setOpen(false); // Close the popover first
        onAdd(searchQuery);
    }
  }
  
  const displayValue = options.find(option => option.value.toLowerCase() === value?.toLowerCase())?.label || value;
  
  const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen && onBlur) {
          onBlur();
      }
  }

  const handleTriggerFocus = () => {
      if (autoOpenOnFocus) {
          setOpen(true);
      }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
        if (open) {
            e.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
        }
    }
  }

  return (
    <ClientOnly>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            onFocus={handleTriggerFocus}
            onKeyDown={handleKeyDown}
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
        >
          <Command onKeyDown={handleKeyDown}>
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={allowFreeform ? value : searchQuery}
              onValueChange={handleInputChange}
            />
            <CommandList>
              <CommandEmpty>
                  <div className="py-4 text-center text-sm">
                      <p>{notFoundMessage}</p>
                      {onAdd && (
                          <Button variant="link" size="sm" className="mt-2" onClick={handleAdd}>
                              <PlusCircle className="mr-2 h-4 w-4"/>
                              {addMessage} "{searchQuery}"
                          </Button>
                      )}
                  </div>
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.toLowerCase() === option.value.toLowerCase() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ClientOnly>
  )
}
