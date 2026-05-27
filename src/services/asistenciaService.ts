export interface WeeklyScheduleItem {
  dia: number;
  entrada: string | null;
  salida: string | null;
  horas_requeridas: number;
}

export interface AsistenciaEmpleado {
  id: number;
  nombre: string;
  horario_habitual: WeeklyScheduleItem[];
  fecha_inicio: string | null;
  fecha_fin: string | null;
  balance_total: number;
}

export interface AsistenciaRegistro {
  id: number;
  empleado_id: number;
  fecha: string;
  turno: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  horas_comida: number;
  horas_trabajadas: number | null;
  horas_esperadas: number;
  balance: number;
  programado_entrada: string | null;
  programado_salida: string | null;
  suma_resta: number;
}

const getApiUrl = (): string => {
  if (window.API_CONFIG?.getApiUrl) {
    return window.API_CONFIG.getApiUrl();
  }
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;

  let backendPort = '3000';
  if (port === '5173' || port === '3000' || port === '') {
    backendPort = '3000';
  } else if (port === '5174' || port === '3001') {
    backendPort = '3001';
  } else if (port === '5175' || port === '5000') {
    backendPort = '5000';
  }

  return `${protocol}//${hostname}:${backendPort}/api`;
};

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const asistenciaService = {
  async getEmpleados(): Promise<AsistenciaEmpleado[]> {
    try {
      const response = await fetch(`${getApiUrl()}/asistencia/empleados`, {
        headers: getHeaders()
      });
      const res = await response.json();
      return res.success ? res.data : [];
    } catch (e) {
      console.error('Error fetching empleados:', e);
      return [];
    }
  },

  async createOrUpdateEmpleado(empleado: Partial<AsistenciaEmpleado>): Promise<{ success: boolean; data?: AsistenciaEmpleado; message?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/asistencia/empleados`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(empleado)
      });
      return await response.json();
    } catch (e: any) {
      console.error('Error saving empleado:', e);
      return { success: false, message: e.message || 'Error de conexión' };
    }
  },

  async deleteEmpleado(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/asistencia/empleados/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (e: any) {
      console.error('Error deleting empleado:', e);
      return { success: false, message: e.message || 'Error de conexión' };
    }
  },

  async checkImport(nombres: string[]): Promise<{ nombre: string; existe: boolean; ultima_fecha: string | null; horario_habitual: WeeklyScheduleItem[] | null }[]> {
    try {
      const response = await fetch(`${getApiUrl()}/asistencia/check-import`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nombres })
      });
      const res = await response.json();
      return res.success ? res.data : [];
    } catch (e) {
      console.error('Error checking import names:', e);
      return [];
    }
  },

  async importAsistencia(registros: any[]): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/asistencia/import`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ registros })
      });
      return await response.json();
    } catch (e: any) {
      console.error('Error importing attendance:', e);
      return { success: false, message: e.message || 'Error de conexión' };
    }
  },

  async getRegistros(empleadoId: number): Promise<{ empleado: AsistenciaEmpleado; registros: AsistenciaRegistro[] } | null> {
    try {
      const response = await fetch(`${getApiUrl()}/asistencia/registros/${empleadoId}`, {
        headers: getHeaders()
      });
      const res = await response.json();
      return res.success ? res : null;
    } catch (e) {
      console.error('Error fetching registros:', e);
      return null;
    }
  },

  async updateRegistro(id: number, data: Partial<AsistenciaRegistro>): Promise<{ success: boolean; data?: AsistenciaRegistro; message?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/asistencia/registros/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (e: any) {
      console.error('Error updating register:', e);
      return { success: false, message: e.message || 'Error de conexión' };
    }
  }
};
