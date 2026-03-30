import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';

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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return suggestions.filter(s => s.toLowerCase().includes(searchLower));
  }, [search, suggestions]);

  // Calcular posición del dropdown basado en el input
  const updateDropdownPos = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 180),
    });
  };

  useEffect(() => {
    if (showDropdown) updateDropdownPos();
  }, [showDropdown]);

  // Recalcular si la ventana hace scroll
  useEffect(() => {
    if (!showDropdown) return;
    const handler = () => updateDropdownPos();
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [showDropdown]);

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 200);
  };

  const handleSelect = (suggestion: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(suggestion);
    setShowDropdown(false);
    setSearch('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={showDropdown ? search : value}
        onChange={handleInputChange}
        onFocus={() => {
          setShowDropdown(true);
          setSearch('');
          updateDropdownPos();
        }}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 text-xs disabled:opacity-50 ${className}`}
      />
      {showDropdown && filtered.length > 0 && ReactDOM.createPortal(
        <div
          className="fixed bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 99999,
          }}
          onMouseDown={e => e.preventDefault()}
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default TextAutocomplete;
