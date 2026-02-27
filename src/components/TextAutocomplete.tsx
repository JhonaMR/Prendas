import React, { useState, useRef, useMemo } from 'react';

interface TextAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TextAutocomplete: React.FC<TextAutocompleteProps> = ({
  value,
  onChange,
  suggestions,
  placeholder = 'Buscar...',
  disabled = false,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Filtrar sugerencias case-insensitive
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return suggestions.filter(s => 
      s.toLowerCase().includes(searchLower)
    );
  }, [search, suggestions]);

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 300);
  };

  const handleSelect = (suggestion: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(suggestion);
    setShowDropdown(false);
    setSearch('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    onChange(newValue);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={showDropdown ? search : value}
        onChange={handleInputChange}
        onFocus={() => {
          setShowDropdown(true);
          setSearch('');
        }}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 text-xs disabled:opacity-50 ${className}`}
      />
      {showDropdown && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
          style={{
            zIndex: 9999,
            minWidth: '100%'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map((suggestion, idx) => (
            <button
              key={idx}
              onMouseDown={() => handleSelect(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 text-xs font-bold text-slate-800"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TextAutocomplete;
