
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

interface ComboboxProps {
    options: { label: string; value: string }[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundMessage?: string;
    addMessage?: string;
    onAdd?: (query?: string) => void;
}

export function Combobox({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select an option...", 
    searchPlaceholder = "Search...",
    notFoundMessage = "No option found.",
    addMessage = "Add new",
    onAdd
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const justClosedByEscape = React.useRef(false);

  const selectedOption = options.find(option => option.value.toLowerCase() === value?.toLowerCase());

  const handleAdd = () => {
    if (onAdd) {
        setOpen(false); // Close the popover first
        onAdd(searchQuery); // Then open the dialog
        // Focus is automatically returned by the Dialog component to its trigger, 
        // which in this case is not what we want. We want to return it to our button.
        // We will handle this by re-focusing our trigger when the popover's open state changes.
    }
  }
  
  const handleFocus = () => {
    if (justClosedByEscape.current) {
        justClosedByEscape.current = false;
        return;
    }
    if (!open) {
      setOpen(true);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      justClosedByEscape.current = true;
      setOpen(false);
      triggerRef.current?.focus();
    }
  }
  
  React.useEffect(() => {
    if (open) {
      // Small timeout to allow the popover to render before focusing the input
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            // When popover closes, ensure focus returns to the trigger button.
            // This also handles the case after a dialog closes.
            triggerRef.current?.focus();
        }
    }}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onFocus={handleFocus}
          // We use onKeyDown here for Enter/Space to open, but not for Escape.
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (!open) {
                    e.preventDefault();
                    setOpen(true);
                }
            } else if (e.key === 'Tab') {
                // This allows the user to tab away from the component
                return;
            }
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} onKeyDown={handleKeyDown}>
          <CommandInput
            ref={inputRef} 
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
                <div className="py-4 text-center text-sm">
                    <p>{notFoundMessage}</p>
                    {onAdd && (
                         <Button variant="link" size="sm" className="mt-2" onClick={handleAdd}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {addMessage}
                        </Button>
                    )}
                </div>
            </CommandEmpty>
            <CommandGroup>
              {options
                .filter(option => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setSearchQuery('');
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
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
  )
}
