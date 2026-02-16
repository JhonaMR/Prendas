import React, { useState, useRef, useEffect } from 'react';
import { Correria } from '../../types';

interface CorreriaSelectorDropdownProps {
  correrias: Correria[];
  selectedCorreria: string | null;
  onSelect: (correriaId: string) => void;
  loading: boolean;
}

const CorreriaSelectorDropdown: React.FC<CorreriaSelectorDropdownProps> = ({
  correrias,
  selectedCorreria,
  onSelect,
  loading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected correria name
  const selectedCorreriaName = correrias.find(c => c.id === selectedCorreria)?.name || 'Seleccionar correría';

  // Filter correrias based on search term
  const filteredCorrerias = correrias.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (correriaId: string) => {
    onSelect(correriaId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || correrias.length === 0}
        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-between hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-slate-700 font-medium text-left">{selectedCorreriaName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100">
            <input
              type="text"
              placeholder="Buscar correría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Correria List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredCorrerias.length > 0 ? (
              filteredCorrerias.map((correria) => (
                <button
                  key={correria.id}
                  onClick={() => handleSelect(correria.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                    selectedCorreria === correria.id ? 'bg-blue-100 text-blue-900' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-medium">{correria.name}</p>
                    <p className="text-xs text-slate-400">{correria.year}</p>
                  </div>
                  {selectedCorreria === correria.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-blue-600">
                      <path fillRule="evenodd" d="M19.915 11.086a.75.75 0 00-1.036-.612l-8.4 5.6a.75.75 0 01-.882 0l-8.4-5.6a.75.75 0 00-1.036.612v6.414c0 .9.693 1.634 1.549 1.634h15.753c.856 0 1.549-.733 1.549-1.634v-6.414z" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-slate-500 text-sm">
                No se encontraron correrias
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CorreriaSelectorDropdown;
