import React, { useRef } from 'react';
import { Correria } from '../../types';

interface CorreriaAutocompleteProps {
  value: string;
  correrias: Correria[];
  onChange: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  placeholder?: string;
}

const CorreriaAutocomplete: React.FC<CorreriaAutocompleteProps> = ({
  value,
  correrias,
  onChange,
  search,
  setSearch,
  showDropdown,
  setShowDropdown,
  placeholder = 'Buscar...'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const correria = correrias.find(c => c.id === value);
  const displayValue = correria ? `${correria.name} ${correria.year}` : value;

  const filtered = correrias.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.year.toString().includes(search)
  );

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 300);
  };

  const handleSelect = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(id);
    setShowDropdown(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={showDropdown ? search : displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setShowDropdown(true); setSearch(''); }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
      />
      {showDropdown && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50 w-full"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-slate-400 text-sm font-bold">Sin resultados</div>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                onMouseDown={() => handleSelect(c.id)}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <p className="font-black text-slate-800 text-xs">{c.name}</p>
                <p className="text-[9px] text-slate-400">{c.year}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CorreriaAutocomplete;
