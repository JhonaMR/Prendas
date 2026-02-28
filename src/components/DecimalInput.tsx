/**
 * Componente DecimalInput
 * Input personalizado que acepta punto y coma como separador decimal
 * Convierte automáticamente punto a coma
 */

import React, { useRef, useEffect } from 'react';

interface DecimalInputProps {
    value: number;
    onChange: (value: number) => void;
    readOnly?: boolean;
    className?: string;
}

const DecimalInput: React.FC<DecimalInputProps> = ({ value, onChange, readOnly = false, className = '' }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [displayValue, setDisplayValue] = React.useState<string>('');

    // Actualizar display cuando cambia el valor
    useEffect(() => {
        setDisplayValue(value.toString().replace('.', ','));
    }, [value]);

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        let val = input.value;

        // Permitir solo números, punto y coma
        val = val.replace(/[^\d.,]/g, '');

        // Convertir punto a coma
        val = val.replace(/\./g, ',');

        // Evitar múltiples comas
        const parts = val.split(',');
        if (parts.length > 2) {
            val = parts[0] + ',' + parts.slice(1).join('');
        }

        // Actualizar display
        setDisplayValue(val);

        // Convertir a número (coma a punto para parseFloat)
        const num = parseFloat(val.replace(',', '.'));
        if (!isNaN(num)) {
            onChange(num);
        } else if (val === '' || val === ',') {
            onChange(0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key;
        
        // Permitir números
        if (/[0-9]/.test(key)) return;
        
        // Permitir punto y coma (ambos como separador decimal)
        if (key === '.' || key === ',') {
            e.preventDefault();
            const input = e.currentTarget;
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const currentVal = input.value;
            
            // Si ya existe una coma, no agregar otra
            if (currentVal.includes(',')) {
                return;
            }
            
            // Insertar coma
            const newVal = currentVal.substring(0, start) + ',' + currentVal.substring(end);
            setDisplayValue(newVal);
            
            // Convertir a número
            const num = parseFloat(newVal.replace(',', '.'));
            if (!isNaN(num)) {
                onChange(num);
            }
            
            // Mover cursor
            setTimeout(() => {
                input.selectionStart = input.selectionEnd = start + 1;
            }, 0);
            return;
        }
        
        // Permitir teclas de control
        const isControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key);
        if (isControl) return;
        
        // Permitir Ctrl+C, Ctrl+V, Ctrl+X
        if (e.ctrlKey || e.metaKey) return;
        
        // Bloquear todo lo demás
        e.preventDefault();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        
        // Limpiar el texto pegado
        let val = pastedText.replace(/[^\d.,]/g, '');
        
        // Convertir punto a coma
        val = val.replace(/\./g, ',');
        
        // Evitar múltiples comas
        const parts = val.split(',');
        if (parts.length > 2) {
            val = parts[0] + ',' + parts.slice(1).join('');
        }
        
        setDisplayValue(val);
        
        // Convertir a número
        const num = parseFloat(val.replace(',', '.'));
        if (!isNaN(num)) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        // Asegurar que el valor sea válido
        if (displayValue === '' || displayValue === ',') {
            setDisplayValue('0');
            onChange(0);
        }
    };

    return (
        <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={handleBlur}
            readOnly={readOnly}
            className={className}
        />
    );
};

export default DecimalInput;
