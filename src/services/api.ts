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
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Error del servidor (${response.status})`,
          error: data.error
        };
      }
      
      return data;
    } catch (error: any) {
      // Si no es JSON válido, retornar error genérico
      if (error instanceof SyntaxError) {
        return {
          success: false,
          message: `Error del servidor (${response.status})`
        };
      }
      return {
        success: false,
        message: error.message || 'Error desconocido'
      };
    }
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
  async register(name: string, loginCode: string, pin: string, role?: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loginCode, pin, role: role || 'general' })
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

  async createUser(name: string, loginCode: string, pin: string, role: string = 'general'): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name, loginCode, pin, role })
      });

      return this.handleResponse<User>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear usuario'
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
      console.log('📋 listUsers response:', data);
      console.log('📋 listUsers data.data:', data.data);
      
      // Si data.data es un array, retornarlo; si data es un array, retornar data
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data as any;
      }
      return [];
    } catch (error) {
      console.error('Error listando usuarios:', error);
      return [];
    }
  }

  /**
   * Actualizar usuario (solo admin)
   */
  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(user)
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar usuario'
      };
    }
  }

  /**
   * Eliminar usuario (solo admin)
   */
  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar usuario'
      };
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
      console.log('🔍 Fetching clients from:', `${API_BASE_URL}/clients`);
      const response = await fetch(`${API_BASE_URL}/clients`, {
        headers: this.getAuthHeaders()
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      const data = await this.handleResponse<any[]>(response);
      console.log('🔍 API Response for getClients:', data);
      console.log('🔍 Clients data:', data.data);
      console.log('🔍 Clients count:', data.data?.length || 0);
      
      // Transformar snake_case a camelCase
      const transformedClients = (data.data || []).map((client: any) => ({
        id: client.id,
        name: client.name,
        nit: client.nit,
        address: client.address,
        city: client.city,
        sellerId: client.seller_id
      }));
      
      return transformedClients;
    } catch (error) {
      console.error('❌ Error obteniendo clientes:', error);
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
      console.log('📊 getSellers response:', data);
      const sellers = data.data || [];
      console.log('📊 getSellers returning:', sellers.length, 'sellers', sellers);
      return sellers;
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

  async updateSeller(id: string, seller: Partial<Seller>): Promise<ApiResponse<Seller>> {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(seller)
      });

      return this.handleResponse<Seller>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar vendedor'
      };
    }
  }

  async deleteSeller(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar vendedor'
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

  async updateCorreria(id: string, correria: Partial<Correria>): Promise<ApiResponse<Correria>> {
    try {
      const response = await fetch(`${API_BASE_URL}/correrias/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(correria)
      });

      return this.handleResponse<Correria>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar correria'
      };
    }
  }

  async deleteCorreria(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/correrias/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar correria'
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

  // ==================== DEVOLUCIONES ====================

  async getReturnReceptions(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/return-receptions`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse<any[]>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo devoluciones:', error);
      return [];
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

  async updateDispatch(id: string, dispatch: Partial<Dispatch>): Promise<ApiResponse<Dispatch>> {
    try {
      console.log('✏️ Actualizando despacho:', id, dispatch);
      const response = await fetch(`${API_BASE_URL}/dispatches/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dispatch)
      });

      console.log('✏️ Response status:', response.status);
      console.log('✏️ Response ok:', response.ok);

      const result = await this.handleResponse<Dispatch>(response);
      console.log('✏️ Update result:', result);
      return result;
    } catch (error: any) {
      console.error('✏️ Error en updateDispatch:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar despacho'
      };
    }
  }

  async deleteDispatch(id: string): Promise<ApiResponse> {
    try {
      console.log('🗑️ Eliminando despacho:', id);
      const response = await fetch(`${API_BASE_URL}/dispatches/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      console.log('🗑️ Response status:', response.status);
      console.log('🗑️ Response ok:', response.ok);

      const result = await this.handleResponse(response);
      console.log('🗑️ Delete result:', result);
      return result;
    } catch (error: any) {
      console.error('🗑️ Error en deleteDispatch:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar despacho'
      };
    }
  }

  // ==================== DEVOLUCIONES ====================

  async createReturnReception(returnReception: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/return-receptions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(returnReception)
      });

      return this.handleResponse<any>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear devolución'
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

  /* Guardar múltiples registros de producción en batch */
 
  async saveProductionBatch(trackingData: ProductionTracking[]): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/production/batch`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ trackingData })
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al guardar producción'
      };
    }
  }

  // ==================== DELIVERY DATES ====================

  async getDeliveryDates(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/delivery-dates`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.handleResponse(response);
      return data.data || [];
    } catch (error) {
      console.error('Error obteniendo fechas de entrega:', error);
      return [];
    }
  }

  async saveDeliveryDatesBatch(dates: any[]): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/delivery-dates/batch`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ dates })
      });

      const data = await this.handleResponse(response);
      
      // La respuesta ahora incluye summary, saved, y errors
      return {
        success: data.success,
        message: data.message,
        data: {
          summary: data.summary,
          saved: data.saved,
          errors: data.errors
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al guardar fechas de entrega'
      };
    }
  }

  async deleteDeliveryDate(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/delivery-dates/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar fecha de entrega'
      };
    }
  }

  // ==================== PAGINATION ENDPOINTS ====================

  async getDeliveryDatesWithPagination(page: number = 1, limit: number = 20, filters: any = {}): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/delivery-dates?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener fechas de entrega'
      };
    }
  }

  async getDispatchesWithPagination(page: number = 1, limit: number = 20, filters: any = {}): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/dispatches?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener despachos'
      };
    }
  }

  async getReceptionsWithPagination(page: number = 1, limit: number = 20, filters: any = {}): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/receptions?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener recepciones'
      };
    }
  }

  async getReturnReceptionsWithPagination(page: number = 1, limit: number = 20, filters: any = {}): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/return-receptions?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener devoluciones'
      };
    }
  }
}

// ==================== ADAPTADORES PARA HOOKS ====================
// Estos adaptadores permiten que los hooks usen una interfaz consistente

// Crear adaptadores para cada entidad
const createEntityAdapter = (
  getMethod: () => Promise<any[]>,
  createMethod: (data: any) => Promise<any>,
  updateMethod: (id: string, data: any) => Promise<any>,
  deleteMethod: (id: string) => Promise<any>
) => ({
  list: getMethod,
  create: createMethod,
  update: updateMethod,
  delete: deleteMethod,
  read: async (id: string) => {
    const items = await getMethod();
    return items.find((item: any) => item.id === id);
  }
});

// Extender la instancia de API con adaptadores
const apiInstance = new ApiService();

// Agregar adaptadores para cada entidad
(apiInstance as any).references = createEntityAdapter(
  () => apiInstance.getReferences(),
  (data) => apiInstance.createReference(data),
  (id, data) => apiInstance.updateReference(id, data),
  (id) => apiInstance.deleteReference(id)
);

(apiInstance as any).clients = createEntityAdapter(
  () => apiInstance.getClients(),
  (data) => apiInstance.createClient(data),
  (id, data) => apiInstance.updateClient(id, data),
  (id) => apiInstance.deleteClient(id)
);

(apiInstance as any).confeccionistas = createEntityAdapter(
  () => apiInstance.getConfeccionistas(),
  (data) => apiInstance.createConfeccionista(data),
  (id, data) => apiInstance.updateConfeccionista(id, data),
  (id) => apiInstance.deleteConfeccionista(id)
);

(apiInstance as any).sellers = createEntityAdapter(
  () => apiInstance.getSellers(),
  (data) => apiInstance.createSeller(data),
  (id, data) => apiInstance.updateSeller(id, data),
  (id) => apiInstance.deleteSeller(id)
);

(apiInstance as any).correrias = createEntityAdapter(
  () => apiInstance.getCorrerias(),
  (data) => apiInstance.createCorreria(data),
  (id, data) => apiInstance.updateCorreria(id, data),
  (id) => apiInstance.deleteCorreria(id)
);

// Exportar instancia única
export const api = apiInstance;
export default api;
