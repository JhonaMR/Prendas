import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { DeliveryDate } from '../types';

interface DeliveryDatesImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: DeliveryDate[]) => void;
  confeccionistas: any[];
}

interface ImportPreview {
  valid: DeliveryDate[];
  invalid: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
}

const DeliveryDatesImportModal: React.FC<DeliveryDatesImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  confeccionistas
}) => {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getColumnValue = (row: any, possibleNames: string[]): any => {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return row[name];
      }
    }
    return null;
  };

  const validateRow = (row: any, rowIndex: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validar confeccionista (solo que no esté vacío)
    const confValue = getColumnValue(row, ['CONFECCIONISTAS Y TERCEROS', 'CONFECCIONISTA']);
    if (!confValue || String(confValue).trim() === '') {
      errors.push('Confeccionista requerido');
    }

    // Validar referencia (solo que no esté vacío)
    const refValue = getColumnValue(row, ['REFERENCIA', 'REF']);
    if (!refValue || String(refValue).trim() === '') {
      errors.push('Referencia requerida');
    }

    // Validar cantidad
    const quantity = Number(getColumnValue(row, ['CANTIDAD', 'CANT']));
    if (!quantity || quantity <= 0) {
      errors.push('Cantidad debe ser mayor a 0');
    }

    // Validar fechas - buscar por múltiples nombres posibles
    const sendDate = parseExcelDate(getColumnValue(row, ['FECHA ENVIO LOTE', 'FECHA ENVÍO LOTE', 'ENVIO LOTE']));
    const expectedDate = parseExcelDate(getColumnValue(row, ['FECHA PRESUPUESTO AÑO 25', 'FECHA PRESUPUSTADA DE ENTREGA', 'FECHA PRESUPUESTO', 'PRESUPUESTO']));
    const deliveryDate = getColumnValue(row, ['FECHA ENTREGA', 'ENTREGA']) ? parseExcelDate(getColumnValue(row, ['FECHA ENTREGA', 'ENTREGA'])) : null;

    if (!sendDate) {
      errors.push('Fecha envío lote inválida');
    }
    if (!expectedDate) {
      errors.push('Fecha presupuesto inválida');
    }

    // Validar que sendDate <= expectedDate
    if (sendDate && expectedDate && sendDate > expectedDate) {
      errors.push('Fecha envío no puede ser posterior a fecha presupuesto');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const parseExcelDate = (value: any): string | null => {
    if (!value) return null;

    // Si ya es string en formato YYYY-MM-DD
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    // Si es string en formato DD/MM/YYYY
    if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/');
      return `${year}-${month}-${day}`;
    }

    // Si es número (Excel serial date)
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }

    return null;
  };

  const getConfeccionistaName = (name: string): string => {
    // Devolver el nombre tal como está
    return String(name).trim();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      const valid: DeliveryDate[] = [];
      const invalid: ImportPreview['invalid'] = [];

      rows.forEach((row: any, index: number) => {
        const validation = validateRow(row, index);

        if (validation.valid) {
          const sendDate = parseExcelDate(getColumnValue(row, ['FECHA ENVIO LOTE', 'FECHA ENVÍO LOTE', 'ENVIO LOTE']));
          const expectedDate = parseExcelDate(getColumnValue(row, ['FECHA PRESUPUESTO AÑO 25', 'FECHA PRESUPUSTADA DE ENTREGA', 'FECHA PRESUPUESTO', 'PRESUPUESTO']));
          const deliveryDate = getColumnValue(row, ['FECHA ENTREGA', 'ENTREGA']) ? parseExcelDate(getColumnValue(row, ['FECHA ENTREGA', 'ENTREGA'])) : null;

          const deliveryDateRecord: DeliveryDate = {
            id: `import_${Date.now()}_${index}`,
            confeccionistaId: getConfeccionistaName(getColumnValue(row, ['CONFECCIONISTAS Y TERCEROS', 'CONFECCIONISTA'])),
            referenceId: String(getColumnValue(row, ['REFERENCIA', 'REF'])).trim(),
            quantity: Number(getColumnValue(row, ['CANTIDAD', 'CANT'])),
            sendDate: sendDate || '',
            expectedDate: expectedDate || '',
            deliveryDate,
            process: getColumnValue(row, ['PROCESO']) ? String(getColumnValue(row, ['PROCESO'])).trim() : '',
            observation: getColumnValue(row, ['OBSERVACION', 'OBSERVACIÓN']) ? String(getColumnValue(row, ['OBSERVACION', 'OBSERVACIÓN'])).trim() : '',
            createdAt: new Date().toISOString(),
            createdBy: 'import'
          };

          valid.push(deliveryDateRecord);
        } else {
          invalid.push({
            row: index + 2, // +2 porque fila 1 es header y arrays son 0-indexed
            data: row,
            errors: validation.errors
          });
        }
      });

      setPreview({
        valid,
        invalid
      });
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error al leer el archivo. Asegúrate de que sea un Excel válido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!preview || preview.valid.length === 0) {
      alert('No hay registros válidos para importar');
      return;
    }

    onImport(preview.valid);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleReset = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center border-b border-blue-700">
          <div>
            <h2 className="text-2xl font-black text-white">Importar Fechas de Entrega</h2>
            <p className="text-blue-100 text-sm mt-1">Carga datos desde Excel</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {!preview ? (
            // File Upload Section
            <div className="space-y-6">
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-blue-500 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
                </svg>
                <h3 className="text-lg font-black text-slate-800 mb-2">Selecciona tu archivo Excel</h3>
                <p className="text-slate-500 text-sm mb-4">Arrastra aquí o haz click para seleccionar</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Cargando...' : 'Seleccionar archivo'}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El archivo debe tener las siguientes columnas:
                  CONFECCIONISTAS Y TERCEROS, REFERENCIA, CANTIDAD, FECHA ENVIO LOTE, 
                  FECHA PRESUPUESTO AÑO 25, FECHA ENTREGA, PROCESO, OBSERVACION
                </p>
              </div>
            </div>
          ) : (
            // Preview Section
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-600 font-bold">Registros válidos</p>
                  <p className="text-3xl font-black text-green-700">{preview.valid.length}</p>
                </div>
                <div className={`${preview.invalid.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'} rounded-xl p-4`}>
                  <p className={`text-sm font-bold ${preview.invalid.length > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                    Registros con errores
                  </p>
                  <p className={`text-3xl font-black ${preview.invalid.length > 0 ? 'text-red-700' : 'text-slate-700'}`}>
                    {preview.invalid.length}
                  </p>
                </div>
              </div>

              {/* Valid Records Preview */}
              {preview.valid.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-3">Registros a importar</h3>
                  <div className="bg-slate-50 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-bold">Confeccionista</th>
                          <th className="px-3 py-2 text-left font-bold">Referencia</th>
                          <th className="px-3 py-2 text-center font-bold">Cantidad</th>
                          <th className="px-3 py-2 text-left font-bold">Envío</th>
                          <th className="px-3 py-2 text-left font-bold">Presupuesto</th>
                          <th className="px-3 py-2 text-left font-bold">Entrega</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {preview.valid.slice(0, 10).map((record, idx) => (
                          <tr key={idx} className="hover:bg-slate-100">
                            <td className="px-3 py-2">{record.confeccionistaId}</td>
                            <td className="px-3 py-2">{record.referenceId}</td>
                            <td className="px-3 py-2 text-center">{record.quantity}</td>
                            <td className="px-3 py-2">{record.sendDate}</td>
                            <td className="px-3 py-2">{record.expectedDate}</td>
                            <td className="px-3 py-2">{record.deliveryDate || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.valid.length > 10 && (
                      <div className="px-3 py-2 bg-slate-100 text-center text-xs font-bold text-slate-600">
                        +{preview.valid.length - 10} registros más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invalid Records */}
              {preview.invalid.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-red-700 mb-3">Registros con errores</h3>
                  <div className="bg-red-50 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    {preview.invalid.map((item, idx) => (
                      <div key={idx} className="border-b border-red-200 p-3 last:border-0">
                        <p className="font-bold text-red-700 text-sm">Fila {item.row}</p>
                        <ul className="text-xs text-red-600 mt-1 space-y-1">
                          {item.errors.map((error, errIdx) => (
                            <li key={errIdx} className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-end gap-3">
          {preview ? (
            <>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={preview.valid.length === 0}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar {preview.valid.length} registros
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDatesImportModal;
