import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import api from '../services/api';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';

interface Backup {
  filename: string;
  path: string;
  size: number;
  sizeInMB: string;
  createdAt: string;
  createdAtISO: string;
  type: 'daily' | 'weekly' | 'monthly';
}

interface BackupStats {
  totalBackups: number;
  totalSizeInMB: string;
  totalSizeInGB: string;
  byType: {
    daily: { count: number; sizeInMB: string };
    weekly: { count: number; sizeInMB: string };
    monthly: { count: number; sizeInMB: string };
  };
}

interface BackupAlert {
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  title: string;
  message: string;
  details?: any;
}

const BackupManagementView: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alerts, setAlerts] = useState<BackupAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const backupsPagination = usePagination(1, 50);

  useEffect(() => {
    loadBackups();
    loadStats();

    const interval = setInterval(() => {
      loadBackups();
      loadStats();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    backupsPagination.pagination.total = backups.length;
    backupsPagination.pagination.totalPages = Math.ceil(backups.length / backupsPagination.pagination.limit);
  }, [backups.length, backupsPagination.pagination.limit]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await api.getBackups();
      if (response.success) {
        // El controlador retorna { success, backups, stats }
        // No { success, data: { backups } }
        setBackups(response.backups || []);
        setError(null);
      }
    } catch (err: any) {
      setError('Error cargando backups: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getBackupStats();
      if (response.success) {
        // El controlador retorna { success, stats, backupsByType }
        setStats(response.stats || null);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const handleManualBackup = async () => {
    try {
      setLoading(true);
      setAlerts([]);
      setShowAlerts(false);

      const response = await api.executeManualBackup();

      if (response.alerts && response.alerts.length > 0) {
        setAlerts(response.alerts);
        setShowAlerts(true);
      }

      if (response.success) {
        loadBackups();
        loadStats();
      }
    } catch (err: any) {
      const errorAlert: BackupAlert = {
        type: 'ERROR',
        title: '❌ Error en Backup Manual',
        message: err.response?.data?.error || err.message || 'Error desconocido',
        details: err.response?.data?.alert?.details
      };
      setAlerts([errorAlert]);
      setShowAlerts(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (backup: Backup) => {
    setSelectedBackup(backup);
    setShowConfirmModal(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedBackup) return;

    try {
      setRestoring(true);
      setShowConfirmModal(false);

      const response = await api.restoreBackup(selectedBackup.filename);

      if (response.success) {
        alert('✅ Backup restaurado exitosamente\n\nLa aplicación se recargará en 3 segundos...');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err: any) {
      alert('❌ Error restaurando backup: ' + (err.response?.data?.error || err.message));
    } finally {
      setRestoring(false);
      setSelectedBackup(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-700';
      case 'weekly':
        return 'bg-green-100 text-green-700';
      case 'monthly':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getBackupTypeLabel = (type: string) => {
    switch (type) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestión de Backups</h1>
          <p className="text-sm text-slate-500 mt-1">Administra y restaura backups de la base de datos</p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total de Backups</p>
            <p className="text-4xl font-black text-slate-900">{stats.totalBackups}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Almacenamiento Total</p>
            <p className="text-3xl font-black text-slate-900">{stats.totalSizeInMB}</p>
            <p className="text-xs text-slate-400 mt-1">MB</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diarios</p>
            <p className="text-3xl font-black text-blue-600">{stats.byType.daily.count}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.byType.daily.sizeInMB} MB</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Semanales</p>
            <p className="text-3xl font-black text-green-600">{stats.byType.weekly.count}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.byType.weekly.sizeInMB} MB</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mensuales</p>
            <p className="text-3xl font-black text-red-600">{stats.byType.monthly.count}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.byType.monthly.sizeInMB} MB</p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleManualBackup}
          disabled={loading || restoring}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
          </svg>
          {loading ? '⏳ Ejecutando...' : '💾 Backup Manual'}
        </button>
        <button
          onClick={loadBackups}
          disabled={loading || restoring}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-5.971m0 0eqn.023-9.348h4.992m0 0a3.022 3.022 0 010 5.957m-2.165 2.756h5.338a3 3 0 00 3-3V5.359a3 3 0 00-3-3h-5.337a3 3 0 00-3 3v13.999a3 3 0 003 3z" />
          </svg>
          🔄 Recargar
        </button>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}

      {/* Alertas de Backup */}
      {showAlerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const bgColor = {
              SUCCESS: 'bg-green-50 border-green-200',
              WARNING: 'bg-yellow-50 border-yellow-200',
              ERROR: 'bg-red-50 border-red-200',
              INFO: 'bg-blue-50 border-blue-200'
            }[alert.type];

            const textColor = {
              SUCCESS: 'text-green-700',
              WARNING: 'text-yellow-700',
              ERROR: 'text-red-700',
              INFO: 'text-blue-700'
            }[alert.type];

            const borderColor = {
              SUCCESS: 'border-green-200',
              WARNING: 'border-yellow-200',
              ERROR: 'border-red-200',
              INFO: 'border-blue-200'
            }[alert.type];

            return (
              <div key={idx} className={`rounded-2xl p-4 border ${bgColor}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${textColor} mb-1`}>{alert.title}</h3>
                    <p className={`text-sm ${textColor} mb-2`}>{alert.message}</p>
                    {alert.details && (
                      <div className={`text-xs ${textColor} opacity-75 space-y-1 mt-2`}>
                        {typeof alert.details === 'object' ? (
                          Object.entries(alert.details).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {String(value)}
                            </div>
                          ))
                        ) : (
                          <div>{String(alert.details)}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAlerts(false)}
                    className={`flex-shrink-0 p-2 rounded-lg hover:bg-white/50 transition-colors ${textColor}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista de backups */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">📁 Backups Disponibles</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-semibold">Cargando backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 font-semibold">No hay backups disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tamaño</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.slice((backupsPagination.pagination.page - 1) * backupsPagination.pagination.limit, backupsPagination.pagination.page * backupsPagination.pagination.limit).map((backup) => (
                  <tr key={backup.filename} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getBackupTypeColor(backup.type)}`}>
                        {getBackupTypeLabel(backup.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{formatDate(backup.createdAtISO)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{backup.sizeInMB} MB</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRestoreClick(backup)}
                        disabled={restoring}
                        className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md"
                      >
                        ↩️ Restaurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationComponent 
              currentPage={backupsPagination.pagination.page}
              totalPages={backupsPagination.pagination.totalPages}
              pageSize={backupsPagination.pagination.limit}
              onPageChange={backupsPagination.goToPage}
              onPageSizeChange={backupsPagination.setLimit}
            />
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && selectedBackup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-yellow-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c.866 1.5 2.926 2.871 5.303 2.871s4.437-1.372 5.303-2.87m0 0a3.75 3.75 0 11-7.5 0m7.5 0a3.75 3.75 0 1-7.5 0" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900">⚠️ Confirmar Restauración</h2>
            </div>

            <div className="space-y-3">
              <p className="text-slate-700">
                ¿Estás seguro de que deseas restaurar el backup de{' '}
                <strong>{formatDate(selectedBackup.createdAtISO)}</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 font-semibold">
                  ⚠️ Se perderán todos los cambios posteriores a esta fecha. Se creará automáticamente un backup de seguridad del estado actual.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={restoring}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={restoring}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {restoring ? '⏳ Restaurando...' : '✅ Restaurar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManagementView;
