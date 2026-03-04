# Componente de Backups para el Frontend

## 📋 Descripción

Ejemplo de cómo implementar la interfaz de gestión de backups en React.

## 🎨 Componente Principal

```jsx
// src/pages/Admin/BackupManagement.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BackupManagement.css';

const BackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Cargar backups al montar el componente
  useEffect(() => {
    loadBackups();
    loadStats();
    
    // Recargar cada 5 minutos
    const interval = setInterval(() => {
      loadBackups();
      loadStats();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Cargar lista de backups
  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/backups', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBackups(response.data.backups);
      setError(null);
    } catch (err) {
      setError('Error cargando backups: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await axios.get('/api/backups/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  // Ejecutar backup manual
  const handleManualBackup = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/backups/manual', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        alert('✅ Backup ejecutado exitosamente');
        loadBackups();
        loadStats();
      }
    } catch (err) {
      alert('❌ Error ejecutando backup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de confirmación para restaurar
  const handleRestoreClick = (backup) => {
    setSelectedBackup(backup);
    setShowConfirmModal(true);
  };

  // Confirmar restauración
  const handleConfirmRestore = async () => {
    if (!selectedBackup) return;

    try {
      setRestoring(true);
      setShowConfirmModal(false);

      const response = await axios.post(
        '/api/backups/restore',
        { backupFilename: selectedBackup.filename },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        alert('✅ Backup restaurado exitosamente\n\nLa aplicación se recargará en 3 segundos...');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err) {
      alert('❌ Error restaurando backup: ' + err.message);
    } finally {
      setRestoring(false);
      setSelectedBackup(null);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Obtener color según tipo de backup
  const getBackupTypeColor = (type) => {
    switch (type) {
      case 'daily':
        return '#3498db'; // Azul
      case 'weekly':
        return '#2ecc71'; // Verde
      case 'monthly':
        return '#e74c3c'; // Rojo
      default:
        return '#95a5a6'; // Gris
    }
  };

  // Obtener etiqueta según tipo de backup
  const getBackupTypeLabel = (type) => {
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
    <div className="backup-management">
      <h1>🔄 Gestión de Backups</h1>

      {/* Estadísticas */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total de Backups</h3>
            <p className="stat-value">{stats.totalBackups}</p>
          </div>
          <div className="stat-card">
            <h3>Almacenamiento Total</h3>
            <p className="stat-value">{stats.totalSizeInMB} MB</p>
          </div>
          <div className="stat-card">
            <h3>Backups Diarios</h3>
            <p className="stat-value">{stats.byType.daily.count}</p>
            <p className="stat-subtitle">{stats.byType.daily.sizeInMB} MB</p>
          </div>
          <div className="stat-card">
            <h3>Backups Semanales</h3>
            <p className="stat-value">{stats.byType.weekly.count}</p>
            <p className="stat-subtitle">{stats.byType.weekly.sizeInMB} MB</p>
          </div>
          <div className="stat-card">
            <h3>Backups Mensuales</h3>
            <p className="stat-value">{stats.byType.monthly.count}</p>
            <p className="stat-subtitle">{stats.byType.monthly.sizeInMB} MB</p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleManualBackup}
          disabled={loading || restoring}
        >
          {loading ? '⏳ Ejecutando...' : '💾 Backup Manual'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={loadBackups}
          disabled={loading || restoring}
        >
          🔄 Recargar
        </button>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Lista de backups */}
      <div className="backups-container">
        <h2>📁 Backups Disponibles</h2>
        
        {loading ? (
          <p className="loading">Cargando backups...</p>
        ) : backups.length === 0 ? (
          <p className="no-backups">No hay backups disponibles</p>
        ) : (
          <table className="backups-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Tamaño</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.filename}>
                  <td>
                    <span
                      className="backup-type-badge"
                      style={{ backgroundColor: getBackupTypeColor(backup.type) }}
                    >
                      {getBackupTypeLabel(backup.type)}
                    </span>
                  </td>
                  <td>{formatDate(backup.createdAtISO)}</td>
                  <td>{backup.sizeInMB} MB</td>
                  <td>
                    <button
                      className="btn btn-small btn-restore"
                      onClick={() => handleRestoreClick(backup)}
                      disabled={restoring}
                    >
                      ↩️ Restaurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && selectedBackup && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>⚠️ Confirmar Restauración</h2>
            <p>
              ¿Estás seguro de que deseas restaurar el backup de{' '}
              <strong>{formatDate(selectedBackup.createdAtISO)}</strong>?
            </p>
            <p className="warning-text">
              ⚠️ Se perderán todos los cambios posteriores a esta fecha.
              Se creará automáticamente un backup de seguridad del estado actual.
            </p>
            <div className="modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={restoring}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmRestore}
                disabled={restoring}
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

export default BackupManagement;
```

## 🎨 Estilos CSS

```css
/* src/pages/Admin/BackupManagement.css */

.backup-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.backup-management h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

/* Estadísticas */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #7f8c8d;
  font-size: 14px;
  text-transform: uppercase;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-subtitle {
  margin: 5px 0 0 0;
  color: #95a5a6;
  font-size: 12px;
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-restore {
  background: #2ecc71;
  color: white;
}

.btn-restore:hover:not(:disabled) {
  background: #27ae60;
}

/* Alertas */
.alert {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.alert-error {
  background: #fadbd8;
  color: #c0392b;
  border: 1px solid #e74c3c;
}

/* Tabla de backups */
.backups-container {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.backups-container h2 {
  margin-top: 0;
  color: #2c3e50;
}

.backups-table {
  width: 100%;
  border-collapse: collapse;
}

.backups-table thead {
  background: #ecf0f1;
}

.backups-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #bdc3c7;
}

.backups-table td {
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
}

.backups-table tbody tr:hover {
  background: #f8f9fa;
}

.backup-type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.loading,
.no-backups {
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal h2 {
  margin-top: 0;
  color: #2c3e50;
}

.modal p {
  color: #7f8c8d;
  line-height: 1.6;
}

.warning-text {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 10px;
  color: #856404;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .action-buttons {
    flex-direction: column;
  }

  .backups-table {
    font-size: 14px;
  }

  .backups-table th,
  .backups-table td {
    padding: 8px;
  }
}
```

## 🔗 Integración en el Router

```jsx
// src/App.jsx o src/routes.jsx

import BackupManagement from './pages/Admin/BackupManagement';

// Agregar a las rutas protegidas (solo admin)
const adminRoutes = [
  // ... otras rutas
  {
    path: '/admin/backups',
    element: <BackupManagement />,
    requiredRole: 'admin'
  }
];
```

## 📱 Menú de Navegación

Agregar en el menú de administración:

```jsx
<NavLink to="/admin/backups" className="nav-link">
  🔄 Backups
</NavLink>
```

## 🎯 Características Implementadas

✅ Listar todos los backups disponibles
✅ Ver estadísticas de almacenamiento
✅ Ejecutar backup manual
✅ Restaurar desde cualquier backup
✅ Confirmación antes de restaurar
✅ Backup de seguridad automático antes de restaurar
✅ Recarga automática cada 5 minutos
✅ Interfaz responsive
✅ Manejo de errores
✅ Indicadores de carga

## 🔐 Seguridad

- Solo usuarios con rol **admin** pueden acceder
- Confirmación modal antes de restaurar
- Backup de seguridad automático
- Tokens JWT en headers
