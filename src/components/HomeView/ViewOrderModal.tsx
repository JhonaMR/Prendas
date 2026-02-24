import React, { useState, useEffect } from 'react';

interface NavButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (viewOrder: string[]) => Promise<void>;
  availableViews: NavButton[];
  currentOrder: string[];
  colorScheme: 'pink' | 'blue' | 'green';
  loading?: boolean;
}

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableViews,
  currentOrder,
  colorScheme,
  loading = false
}) => {
  const [order, setOrder] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Inicializar orden
  useEffect(() => {
    if (currentOrder.length > 0) {
      setOrder(currentOrder);
    } else {
      // Si no hay orden guardada, usar el orden por defecto
      setOrder(availableViews.map(v => v.id));
    }
  }, [currentOrder, availableViews, isOpen]);

  const colorMap = {
    pink: {
      border: 'border-pink-500',
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      hover: 'hover:border-pink-600',
      button: 'bg-pink-600 hover:bg-pink-700',
      dragBg: 'bg-pink-100'
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hover: 'hover:border-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      dragBg: 'bg-blue-100'
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
      hover: 'hover:border-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      dragBg: 'bg-green-100'
    }
  };

  const colors = colorMap[colorScheme];

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = order.indexOf(draggedItem);
    const targetIndex = order.indexOf(targetId);

    const newOrder = [...order];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setOrder(newOrder);
    setDraggedItem(null);
  };

  const handleSave = async () => {
    setSaving(true);
    console.log('Guardando orden:', order);
    try {
      const success = await onSave(order);
      console.log('Resultado del guardado:', success);
      if (success !== false) {
        // Si la promesa se resuelve sin error, cerrar el modal
        console.log('Cerrando modal');
        onClose();
      } else {
        console.log('Error: savePreferences retornó false');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const getViewLabel = (viewId: string) => {
    return availableViews.find(v => v.id === viewId)?.label || viewId;
  };

  const getViewIcon = (viewId: string) => {
    return availableViews.find(v => v.id === viewId)?.icon;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Personalizar Orden de Vistas</h2>
            <p className="text-slate-300 text-sm mt-1">Arrastra para reordenar las vistas según tu preferencia</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="space-y-3">
            {order.map((viewId) => (
              <div
                key={viewId}
                draggable
                onDragStart={() => handleDragStart(viewId)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(viewId)}
                className={`
                  p-4 rounded-2xl border-2 cursor-move transition-all
                  ${draggedItem === viewId 
                    ? `${colors.dragBg} ${colors.border} opacity-50` 
                    : `border-slate-200 hover:${colors.border} bg-white hover:shadow-md`
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Drag handle */}
                  <div className="flex-shrink-0 text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z" />
                    </svg>
                  </div>

                  {/* Icon and label */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.dragBg} ${colors.text}`}>
                      {getViewIcon(viewId)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{getViewLabel(viewId)}</p>
                    </div>
                  </div>

                  {/* Position indicator */}
                  <div className="flex-shrink-0 text-slate-400 text-sm font-medium">
                    #{order.indexOf(viewId) + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 md:px-8 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={`px-6 py-2 rounded-lg ${colors.button} text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2`}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Orden'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;
