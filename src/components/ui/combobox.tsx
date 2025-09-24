
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
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundMessage?: string;
    addMessage?: string;
    onAdd?: (query?: string) => void;
    disabled?: boolean;
}

export function Combobox({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select an option...", 
    searchPlaceholder = "Search...",
    notFoundMessage = "No option found.",
    addMessage = "Add new",
    onAdd,
    disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleAdd = () => {
    if (onAdd) {
        setOpen(false); // Close the popover first
        onAdd(searchQuery);
    }
  }
  
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(option => option.value.toLowerCase() === value?.toLowerCase());

  return (
    <ClientOnly>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandInput
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
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setSearchQuery('');
                      setOpen(false);
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
    </ClientOnly>
  )
}
