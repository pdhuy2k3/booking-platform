'use client';

import * as React from 'react';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface City {
  code: string;
  name: string;
  type: string;
}

interface CityComboBoxProps {
  value: City | null;
  onValueChange: (value: City | null) => void;
  placeholder?: string;
  className?: string;
}

export function CityComboBox({ value, onValueChange, placeholder = "Select city...", className }: CityComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [cities, setCities] = React.useState<City[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch cities from tinhthanhpho.com API
  React.useEffect(() => {
    if (search.length < 2) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would call the tinhthanhpho.com API
        // For now, we'll use a mock implementation
        const mockCities: City[] = [
          { code: 'HAN', name: 'Hanoi', type: 'Thành phố' },
          { code: 'SGN', name: 'Ho Chi Minh City', type: 'Thành phố' },
          { code: 'DAD', name: 'Da Nang', type: 'Thành phố' },
          { code: 'CXR', name: 'Nha Trang', type: 'Thành phố' },
          { code: 'VCA', name: 'Can Tho', type: 'Thành phố' },
          { code: 'HPH', name: 'Hai Phong', type: 'Thành phố' },
          { code: 'VII', name: 'Vinh', type: 'Thành phố' },
          { code: 'HUI', name: 'Hue', type: 'Thành phố' },
        ];
        
        // Filter mock cities based on search term
        const filtered = mockCities.filter(city => 
          city.name.toLowerCase().includes(search.toLowerCase()) ||
          city.code.toLowerCase().includes(search.toLowerCase())
        );
        
        setCities(filtered);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {value ? (
            <span className="truncate">
              {value.name} ({value.code})
            </span>
          ) : (
            <span className="text-muted-foreground truncate">{placeholder}</span>
          )}
          <div className="flex items-center gap-2 ml-2">
            {value && (
              <XIcon
                className="h-4 w-4 shrink-0 opacity-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange(null);
                }}
              />
            )}
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search city..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Loading...' : 'No city found.'}
            </CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.code}
                  value={city.code}
                  onSelect={() => {
                    onValueChange(city);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value?.code === city.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{city.name}</span>
                    <span className="text-xs text-muted-foreground">{city.code} • {city.type}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}