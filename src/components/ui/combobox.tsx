
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
    onAdd?: () => void;
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
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Check if the new focused element is outside the popover and its trigger
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.relatedTarget as Node) &&
      triggerRef.current !== event.relatedTarget
    ) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            if (!popoverRef.current?.contains(e.relatedTarget as Node)) {
              setOpen(false);
            }
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        onBlur={handleBlur}
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList>
            <CommandEmpty>
                <div className="py-4 text-center text-sm">
                    <p>{notFoundMessage}</p>
                    {onAdd && (
                         <Button variant="link" size="sm" className="mt-2" onClick={() => { setOpen(false); onAdd(); }}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {addMessage}
                        </Button>
                    )}
                </div>
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(currentValue) => {
                    // Find the option that matches the selected label (case-insensitive)
                    const selected = options.find(opt => opt.label.toLowerCase() === currentValue.toLowerCase());
                    onChange(selected ? selected.value : "")
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
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
