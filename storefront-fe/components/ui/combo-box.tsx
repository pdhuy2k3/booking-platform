'use client';

import * as React from 'react';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ComboBoxProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string }>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
}

export const ComboBox = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  ComboBoxProps
>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      options,
      placeholder = 'Select an option...',
      searchPlaceholder = 'Search...',
      emptyText = 'No results found.',
      className,
      disabled,
      allowClear,
      onClear,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const selectedOption = options.find((option) => option.value === (value || defaultValue));

    const handleSelect = (currentValue: string) => {
      if (currentValue === value) {
        onValueChange?.('');
      } else {
        onValueChange?.(currentValue);
      }
      setOpen(false);
      setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange?.('');
      onClear?.();
      setSearchQuery('');
    };

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between', className)}
            disabled={disabled}
            {...props}
          >
            <span className="truncate">
              {selectedOption ? (
                <span className="flex flex-col items-start">
                  <span className="font-medium">{selectedOption.label}</span>
                  {selectedOption.description && (
                    <span className="text-xs text-muted-foreground">{selectedOption.description}</span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              {allowClear && selectedOption && (
                <XIcon 
                  className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100" 
                  onClick={handleClear}
                />
              )}
              <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                  >
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      )}
                    </div>
                    {option.value === value && (
                      <CheckIcon className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

ComboBox.displayName = 'ComboBox';