/**
 * 🔗 SERVICIO DE API - Frontend React
 * 
 * Este archivo maneja todas las peticiones HTTP al backend
 * Úsalo en tu frontend React para comunicarte con el backend
 * 
 * UBICACIÓN: Copia este archivo en tu frontend React en src/services/api.ts
 */

import type {
  User,
  Reference,
  Client,
  Confeccionista,
  Seller,
  Correria,
  BatchReception,
  Dispatch,
  Order,
  ProductionTracking,
} from '../types';

// URL del backend
// En desarrollo: http://localhost:3000/api
// En producción: http://IP_DEL_SERVIDOR:3000/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Clase que maneja todas las peticiones al backend
 */
class ApiService {
  
  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Obtener headers con autenticación
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Manejar respuesta HTTP
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw data;
    }
    
    return data;
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Login con loginCode + PIN
   */
  async login(loginCode: string, pin: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginCode, pin })
      });

      const data = await this.handleResponse<LoginResponse>(response);

      // Guardar token en localStorage
      if (data.success && data.data) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('current_user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión'
      };
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async register(name: string, loginCode: string, pin: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loginCode, pin })
      });

      const data = await this.handleResponse<LoginResponse>(response);

      // Hacer login automático después de registrar
      if (data.success && data.data) {
        return await this.login(loginCode, pin);
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al registrar usuario'
      };
    }
  }

  /**
   * Cambiar PIN
   */
  async changePin(loginCode: string, currentPin: string, newPin: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-pin`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ loginCode, currentPin, newPin })
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al cambiar PIN'
      };
    }
  }

  /**
   * Listar usuarios (solo admin)
   */
  async listUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<User[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error listando usuarios:', error);
      return [];
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // ==================== REFERENCIAS ====================

  async getReferences(): Promise<Reference[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/references`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<Reference[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo referencias:', error);
      return [];
    }
  }

  async createReference(reference: Partial<Reference>): Promise<ApiResponse<Reference>> {
    try {
      const response = await fetch(`${API_BASE_URL}/references`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reference)
      });

      return this.handleResponse<Reference>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear referencia'
      };
    }
  }

  async updateReference(id: string, reference: Partial<Reference>): Promise<ApiResponse<Reference>> {
    try {
      const response = await fetch(`${API_BASE_URL}/references/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reference)
      });

      return this.handleResponse<Reference>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar referencia'
      };
    }
  }

  async deleteReference(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/references/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar referencia'
      };
    }
  }

  // ==================== CLIENTES ====================

  async getClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<Client[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      return [];
    }
  }

  async createClient(client: Partial<Client>): Promise<ApiResponse<Client>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(client)
      });

      return this.handleResponse<Client>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear cliente'
      };
    }
  }

  async updateClient(id: string, client: Partial<Client>): Promise<ApiResponse<Client>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(client)
      });

      return this.handleResponse<Client>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar cliente'
      };
    }
  }

  async deleteClient(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar cliente'
      };
    }
  }

  // ==================== CONFECCIONISTAS ====================

  async getConfeccionistas(): Promise<Confeccionista[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/confeccionistas`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<Confeccionista[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo confeccionistas:', error);
      return [];
    }
  }

  async createConfeccionista(conf: Partial<Confeccionista>): Promise<ApiResponse<Confeccionista>> {
    try {
      const response = await fetch(`${API_BASE_URL}/confeccionistas`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(conf)
      });

      return this.handleResponse<Confeccionista>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear confeccionista'
      };
    }
  }

  async updateConfeccionista(id: string, conf: Partial<Confeccionista>): Promise<ApiResponse<Confeccionista>> {
    try {
      const response = await fetch(`${API_BASE_URL}/confeccionistas/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(conf)
      });

      return this.handleResponse<Confeccionista>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar confeccionista'
      };
    }
  }

  async deleteConfeccionista(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/confeccionistas/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar confeccionista'
      };
    }
  }

  // ==================== VENDEDORES ====================

  async getSellers(): Promise<Seller[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<Seller[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo vendedores:', error);
      return [];
    }
  }

  async createSeller(seller: Partial<Seller>): Promise<ApiResponse<Seller>> {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(seller)
      });

      return this.handleResponse<Seller>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear vendedor'
      };
    }
  }

  // ==================== CORRERIAS ====================

  async getCorrerias(): Promise<Correria[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/correrias`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<Correria[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo correrias:', error);
      return [];
    }
  }

  async createCorreria(correria: Partial<Correria>): Promise<ApiResponse<Correria>> {
    try {
      const response = await fetch(`${API_BASE_URL}/correrias`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(correria)
      });

      return this.handleResponse<Correria>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear correria'
      };
    }
  }

  // ==================== RECEPCIONES ====================

  async getReceptions(): Promise<BatchReception[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/receptions`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<BatchReception[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo recepciones:', error);
      return [];
    }
  }

  async createReception(reception: Partial<BatchReception>): Promise<ApiResponse<BatchReception>> {
    try {
      const response = await fetch(`${API_BASE_URL}/receptions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reception)
      });

      return this.handleResponse<BatchReception>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear recepción'
      };
    }
  }

  // ==================== DESPACHOS ====================

  async getDispatches(): Promise<Dispatch[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/dispatches`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<Dispatch[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo despachos:', error);
      return [];
    }
  }

  async createDispatch(dispatch: Partial<Dispatch>): Promise<ApiResponse<Dispatch>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dispatches`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dispatch)
      });

      return this.handleResponse<Dispatch>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear despacho'
      };
    }
  }

  // ==================== PEDIDOS ====================

  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<Order[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      return [];
    }
  }

  async createOrder(order: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(order)
      });

      return this.handleResponse<Order>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear pedido'
      };
    }
  }

  // ==================== PRODUCCIÓN ====================

  async getProductionTracking(): Promise<ProductionTracking[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/production`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<ProductionTracking[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo tracking:', error);
      return [];
    }
  }

  async updateProductionTracking(tracking: ProductionTracking): Promise<ApiResponse<ProductionTracking>> {
    try {
      const response = await fetch(`${API_BASE_URL}/production`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tracking)
      });

      return this.handleResponse<ProductionTracking>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar tracking'
      };
    }
  }
}

// Exportar instancia única
export const api = new ApiService();
export default api;
