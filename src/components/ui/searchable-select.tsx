'use client';

import * as React from 'react';
import { CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export interface SearchableSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  size?: 'sm' | 'default';
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Selecciona...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin resultados.',
  disabled = false,
  className,
  triggerClassName,
  size = 'default',
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*=text-])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
            size === 'sm' ? 'h-8' : 'h-9',
            triggerClassName,
          )}
        >
          <span
            className={cn(
              'flex items-center gap-2 truncate',
              !selectedOption && 'text-muted-foreground',
            )}
          >
            {selectedOption ? (
              <>
                {selectedOption.icon}
                {selectedOption.label}
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', className)}
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.icon}
                  {option.label}
                  <CheckIcon
                    className={cn(
                      'ml-auto size-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
