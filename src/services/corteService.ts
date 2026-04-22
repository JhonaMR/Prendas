import api from './api';

export interface CorteRegistro {
  id: string;
  numeroFicha: string;
  fechaCorte: string;
  referencia: string;
  descripcion: string;
  cantidadCortada: number;
}

export const corteService = {
  getRegistros: () => api.getCorteRegistros(),
  createRegistro: (data: any) => api.createCorteRegistro(data),
  updateRegistro: (id: string, data: any) => api.updateCorteRegistro(id, data),
  deleteRegistro: (id: string) => api.deleteCorteRegistro(id),
  importRegistros: (registros: any[]) => api.importCorteRegistros(registros),
};

export default corteService;
