import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import api from '../services/api';
import PaginationComponent from '../components/PaginationComponent';
import usePagination from '../hooks/usePagination';
import { detectInstance, getInstanceName, getInstanceColor } from '../utils/instanceDetector';
import { useDarkMode } from '../context/DarkModeContext';
import { User, UserRole } from '../types';
import { isSoporte } from '../utils/permissions';

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

interface FullDump {
  filename: string;
  sizeInMB: string;
  createdAt: string;
  createdAtISO: string;
}

interface Props {
  user: User;
}

const BackupManagementView: React.FC<Props> = ({ user }) => {
  const { isDark } = useDarkMode();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alerts, setAlerts] = useState<BackupAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [instance, setInstance] = useState(detectInstance());
  const backupsPagination = usePagination(1, 50);

  // Full Dump
  const [generatingFullDump, setGeneratingFullDump] = useState(false);
  const [fullDumps, setFullDumps] = useState<FullDump[]>([]);

  // Upload Dump
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDumpFile, setPendingDumpFile] = useState<File | null>(null);
  const [showUploadConfirmModal, setShowUploadConfirmModal] = useState(false);
  const [uploadingDump, setUploadingDump] = useState(false);

  const esSoporte = isSoporte(user);

  useEffect(() => {
    loadBackups();
    loadStats();
    loadFullDumps();

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
      const response: any = await api.getBackups();
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
      const response: any = await api.getBackupStats();
      if (response.success) {
        // El controlador retorna { success, stats, backupsByType }
        setStats(response.stats || null);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const loadFullDumps = async () => {
    try {
      const response: any = await api.listFullDumps();
      if (response.success) {
        setFullDumps(response.dumps || []);
      }
    } catch (err) {
      console.error('Error cargando full dumps:', err);
    }
  };

  const handleFullDump = async () => {
    try {
      setGeneratingFullDump(true);
      setAlerts([]);
      setShowAlerts(false);

      const response: any = await api.executeFullDump();

      if (response.success) {
        setAlerts([{
          type: 'SUCCESS',
          title: '✅ Full Dump Generado',
          message: `Archivo: ${response.filename} (${response.sizeInMB} MB)`,
          details: { instancia: response.instance, archivo: response.filename }
        }]);
        setShowAlerts(true);
        loadFullDumps();
      } else {
        setAlerts([{
          type: 'ERROR',
          title: '❌ Error al generar Full Dump',
          message: response.error || response.message || 'Error desconocido'
        }]);
        setShowAlerts(true);
      }
    } catch (err: any) {
      setAlerts([{
        type: 'ERROR',
        title: '❌ Error al generar Full Dump',
        message: err.message || 'Error desconocido'
      }]);
      setShowAlerts(true);
    } finally {
      setGeneratingFullDump(false);
    }
  };

  const handleUploadDumpClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingDumpFile(file);
    setShowUploadConfirmModal(true);
  };

  const handleConfirmUploadDump = async () => {
    if (!pendingDumpFile) return;
    try {
      setUploadingDump(true);
      setShowUploadConfirmModal(false);
      setAlerts([]);
      setShowAlerts(false);

      const response: any = await api.uploadDump(pendingDumpFile);

      if (response.success) {
        setAlerts([{
          type: 'SUCCESS',
          title: '✅ Dump Cargado Exitosamente',
          message: `El archivo "${response.originalFile}" fue cargado correctamente. La aplicación se recargará en 3 segundos...`,
          details: { backup_seguridad: response.securityBackup, tamaño: `${response.sizeInMB} MB` }
        }]);
        setShowAlerts(true);
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setAlerts([{
          type: 'ERROR',
          title: '❌ Error al Cargar Dump',
          message: response.error || response.message || 'Error desconocido'
        }]);
        setShowAlerts(true);
      }
    } catch (err: any) {
      setAlerts([{
        type: 'ERROR',
        title: '❌ Error al Cargar Dump',
        message: err.message || 'Error desconocido'
      }]);
      setShowAlerts(true);
    } finally {
      setUploadingDump(false);
      setPendingDumpFile(null);
    }
  };

  const handleCancelUploadDump = () => {
    setShowUploadConfirmModal(false);
    setPendingDumpFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualBackup = async () => {
    try {
      setLoading(true);
      setAlerts([]);
      setShowAlerts(false);

      const response: any = await api.executeManualBackup();

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
    <div className={`space-y-6 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52]' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>Gestión de Backups</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-bold transition-colors duration-300 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              {getInstanceName(instance)}
            </span>
          </div>
          <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>Administra y restaura backups de la base de datos</p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className={`rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Total de Backups</p>
            <p className={`text-4xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{stats.totalBackups}</p>
          </div>
          <div className={`rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Almacenamiento Total</p>
            <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>{stats.totalSizeInMB}</p>
            <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>MB</p>
          </div>
          <div className={`rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Diarios</p>
            <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.byType.daily.count}</p>
            <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{stats.byType.daily.sizeInMB} MB</p>
          </div>
          <div className={`rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Semanales</p>
            <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.byType.weekly.count}</p>
            <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{stats.byType.weekly.sizeInMB} MB</p>
          </div>
          <div className={`rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-400'}`}>Mensuales</p>
            <p className={`text-3xl font-black transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{stats.byType.monthly.count}</p>
            <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{stats.byType.monthly.sizeInMB} MB</p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleManualBackup}
          disabled={loading || restoring}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-900/30' : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
          </svg>
          {loading ? '⏳ Ejecutando...' : '💾 Backup Manual'}
        </button>
        <button
          onClick={loadBackups}
          disabled={loading || restoring}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-2xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] text-violet-300 border-violet-700 hover:bg-[#5a4a75]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
        >
         🔄 Recargar
        </button>

        {/* Botones exclusivos para Soporte */}
        {esSoporte && (
          <>
            <div className={`w-px self-stretch mx-1 transition-colors duration-300 ${isDark ? 'bg-violet-700' : 'bg-slate-200'}`} />
            <button
              onClick={handleFullDump}
              disabled={generatingFullDump || uploadingDump}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-violet-700 to-violet-600 text-white hover:shadow-lg hover:shadow-violet-900/30' : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:shadow-lg hover:shadow-violet-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
              {generatingFullDump ? '⏳ Generando...' : '🗄️ Full Dump'}
            </button>
            <button
              onClick={handleUploadDumpClick}
              disabled={generatingFullDump || uploadingDump}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-orange-700 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-900/30' : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:shadow-lg hover:shadow-orange-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {uploadingDump ? '⏳ Cargando...' : '📂 Cargar Dump'}
            </button>
            {/* Input oculto para seleccionar archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              className="hidden"
              onChange={handleFileSelected}
            />
          </>
        )}
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className={`rounded-2xl p-4 font-semibold border transition-colors duration-300 ${isDark ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Alertas de Backup */}
      {showAlerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const bgColor = {
              SUCCESS: isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200',
              WARNING: isDark ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200',
              ERROR: isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200',
              INFO: isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }[alert.type];

            const textColor = {
              SUCCESS: isDark ? 'text-green-400' : 'text-green-700',
              WARNING: isDark ? 'text-yellow-400' : 'text-yellow-700',
              ERROR: isDark ? 'text-red-400' : 'text-red-700',
              INFO: isDark ? 'text-blue-400' : 'text-blue-700'
            }[alert.type];

            return (
              <div key={idx} className={`rounded-2xl p-4 border transition-colors duration-300 ${bgColor}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 ${textColor}`}>{alert.title}</h3>
                    <p className={`text-sm mb-2 transition-colors duration-300 ${textColor}`}>{alert.message}</p>
                    {alert.details && (
                      <div className={`text-xs opacity-75 space-y-1 mt-2 transition-colors duration-300 ${textColor}`}>
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
                    className={`flex-shrink-0 p-2 rounded-lg hover:bg-white/50 transition-colors transition-colors duration-300 ${textColor}`}
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
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
        <div className={`p-6 border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>📁 Backups Disponibles</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>Cargando backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center">
            <p className={`font-semibold transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-500'}`}>No hay backups disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Tipo</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Fecha</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Tamaño</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700/50' : 'divide-slate-100'}`}>
                {backups.slice((backupsPagination.pagination.page - 1) * backupsPagination.pagination.limit, backupsPagination.pagination.page * backupsPagination.pagination.limit).map((backup) => (
                  <tr key={backup.filename} className={`transition-colors duration-300 ${isDark ? 'hover:bg-violet-700/20' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${
                        backup.type === 'daily' ? (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700') :
                        backup.type === 'weekly' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') :
                        backup.type === 'monthly' ? (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700') :
                        (isDark ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700')
                      }`}>
                        {getBackupTypeLabel(backup.type)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>{formatDate(backup.createdAtISO)}</td>
                    <td className={`px-6 py-4 text-sm font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>{backup.sizeInMB} MB</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRestoreClick(backup)}
                        disabled={restoring}
                        className={`px-4 py-2 font-bold rounded-xl text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-600 text-white hover:bg-green-700'}`}
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

      {/* Sección Full Dumps — solo Soporte */}
      {esSoporte && fullDumps.length > 0 && (
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#4a3a63] border-violet-700' : 'bg-white border-slate-100'}`}>
          <div className={`p-6 border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-white border-slate-100'}`}>
            <h2 className={`text-xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>
              🗄️ Full Dumps — {getInstanceName(instance)}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#5a4a75] border-violet-700' : 'bg-slate-50 border-slate-100'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Archivo</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Fecha</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-600'}`}>Tamaño</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-violet-700/50' : 'divide-slate-100'}`}>
                {fullDumps.map((dump) => (
                  <tr key={dump.filename} className={`transition-colors duration-300 ${isDark ? 'hover:bg-violet-700/20' : 'hover:bg-slate-50'}`}>
                    <td className={`px-6 py-4 text-sm font-mono font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>{dump.filename}</td>
                    <td className={`px-6 py-4 text-sm font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>{formatDate(dump.createdAtISO)}</td>
                    <td className={`px-6 py-4 text-sm font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>{dump.sizeInMB} MB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal confirmación Cargar Dump */}
      {showUploadConfirmModal && pendingDumpFile && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-slate-900/50'}`}>
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            {/* Ícono de peligro centrado */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isDark ? 'bg-red-900/40' : 'bg-red-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-10 h-10 transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-black mb-2 transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>
                ¿Cargar este dump?
              </h2>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-600'}`}>
                Toda la información de la base de datos será reemplazada por el contenido del archivo seleccionado.
              </p>
            </div>

            {/* Info del archivo */}
            <div className={`rounded-2xl p-4 mb-6 transition-colors duration-300 ${isDark ? 'bg-[#3d2d52] border border-violet-700' : 'bg-slate-50 border border-slate-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>Archivo seleccionado</p>
              <p className={`text-sm font-semibold font-mono break-all transition-colors duration-300 ${isDark ? 'text-violet-200' : 'text-slate-700'}`}>{pendingDumpFile.name}</p>
              <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-violet-400' : 'text-slate-400'}`}>{(pendingDumpFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            <div className={`rounded-xl p-3 mb-6 transition-colors duration-300 ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-xs font-semibold transition-colors duration-300 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                ⚠️ Se creará un backup de seguridad automático antes de cargar.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelUploadDump}
                className={`flex-1 px-4 py-3 font-bold rounded-2xl transition-all transition-colors duration-300 ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUploadDump}
                className={`flex-1 px-4 py-3 font-bold rounded-2xl transition-all transition-colors duration-300 ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                Cargar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación restauración */}
      {showConfirmModal && selectedBackup && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black/50' : 'bg-slate-900/40'}`}>
          <div className={`rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 transition-colors duration-300 ${isDark ? 'bg-[#4a3a63]' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 transition-colors duration-300 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c.866 1.5 2.926 2.871 5.303 2.871s4.437-1.372 5.303-2.87m0 0a3.75 3.75 0 11-7.5 0m7.5 0a3.75 3.75 0 1-7.5 0" />
                </svg>
              </div>
              <h2 className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-violet-50' : 'text-slate-900'}`}>⚠️ Confirmar Restauración</h2>
            </div>

            <div className="space-y-3">
              <p className={`transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>
                ¿Estás seguro de que deseas restaurar el backup de{' '}
                <strong>{formatDate(selectedBackup.createdAtISO)}</strong>?
              </p>
              <div className={`rounded-xl p-4 transition-colors duration-300 ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                  ⚠️ Se perderán todos los cambios posteriores a esta fecha. Se creará automáticamente un backup de seguridad del estado actual.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={restoring}
                className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-violet-900/40 text-violet-300 hover:bg-violet-900/60' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={restoring}
                className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-600 text-white hover:bg-red-700'}`}
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
