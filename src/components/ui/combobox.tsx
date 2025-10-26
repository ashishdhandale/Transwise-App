
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
  const [suggestion, setSuggestion] = React.useState('');

  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionRef = React.useRef<HTMLInputElement>(null);

  const allOptions = React.useMemo(() =>
    options.flatMap(opt => isGroup(opt) ? opt.options : [opt]),
  [options]);

  const displayValue = React.useMemo(() => {
    return allOptions.find(option => option.value.toLowerCase() === value?.toLowerCase())?.label || value || '';
  }, [value, allOptions]);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
    setSuggestion('');
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (!open) {
      setOpen(true);
    }

    if (newValue) {
        const bestMatch = allOptions.find(opt => opt.label.toLowerCase().startsWith(newValue.toLowerCase()));
        if (bestMatch && bestMatch.label.toLowerCase() !== newValue.toLowerCase()) {
            setSuggestion(bestMatch.label);
        } else {
            setSuggestion('');
        }
    } else {
        setSuggestion('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion && inputRef.current) {
        const cursorPosition = e.currentTarget.selectionStart;
        if (cursorPosition === e.currentTarget.value.length) {
            e.preventDefault();
            const matchedOption = allOptions.find(opt => opt.label === suggestion);
            if (matchedOption) {
                handleSelect(matchedOption.value);
            }
        }
    }
  };


  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setSuggestion('');
      inputRef.current?.focus();
  }

  return (
    <ClientOnly>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
            <PopoverTrigger asChild>
                 <div className="relative">
                    <Input
                        ref={suggestionRef}
                        value={suggestion ? `${displayValue}${suggestion.substring(displayValue.length)}` : displayValue}
                        className="pr-10 absolute inset-0 text-muted-foreground/70 pointer-events-none"
                        readOnly
                        tabIndex={-1}
                    />
                    <Input
                        ref={inputRef}
                        type="text"
                        value={displayValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        className="pr-10 relative bg-transparent"
                        disabled={disabled}
                        autoComplete="off"
                    />
                 </div>
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
                        setOpen(o => !o);
                        inputRef.current?.focus();
                    }}
                 />
            </div>
        </div>
        <PopoverContent 
            style={{ width: inputRef.current?.offsetWidth }}
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
                          <Button variant="link" size="sm" className="mt-2" onClick={() => onAdd(value)}>
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


    