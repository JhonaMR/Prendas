import React, { useState, useEffect } from 'react';

export interface AuditRecord {
  id: number;
  entity_type: string;
  entity_id: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changes: Record<string, { from: any; to: any }> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditHistoryViewProps {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
}

/**
 * Componente para visualizar histórico de cambios
 * Validación: Requirements 6.5, 6.6, 6.7
 */
export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({
  entityType,
  entityId,
  userId,
  action
}) => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditHistory();
  }, [entityType, entityId, userId, action]);

  const fetchAuditHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/audit';
      const params = new URLSearchParams();

      if (entityType && entityId) {
        params.append('entityType', entityType);
        params.append('entityId', entityId);
      } else if (userId) {
        params.append('userId', userId);
      } else if (action) {
        params.append('action', action);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener histórico');

      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando histórico...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No hay registros de auditoría
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Fecha</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Acción</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Entidad</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Usuario</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">Cambios</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(record.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(record.action)}`}>
                      {record.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {record.entity_type} / {record.entity_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.user_id || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {record.changes ? (
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">
                          Ver cambios ({Object.keys(record.changes).length})
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                          {Object.entries(record.changes).map(([key, value]: [string, any]) => (
                            <div key={key} className="font-mono">
                              <span className="font-semibold">{key}:</span>
                              <br />
                              <span className="text-red-600">- {JSON.stringify(value.from)}</span>
                              <br />
                              <span className="text-green-600">+ {JSON.stringify(value.to)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.ip_address || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditHistoryView;
