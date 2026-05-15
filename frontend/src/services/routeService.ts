import axios from 'axios';
import type { SaveRoutePayload, ApiRoute } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const routeService = {
  /** Fetch all saved routes */
  getAll: async (): Promise<ApiRoute[]> => {
    const { data } = await api.get<ApiRoute[]>('/routes');
    return data;
  },

  /** Save a new route */
  create: async (payload: SaveRoutePayload): Promise<ApiRoute> => {
    const { data } = await api.post<ApiRoute>('/routes', payload);
    return data;
  },

  /** Update an existing route */
  update: async (id: string, payload: Partial<SaveRoutePayload>): Promise<ApiRoute> => {
    const { data } = await api.put<ApiRoute>(`/routes/${id}`, payload);
    return data;
  },

  /** Delete a route */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/routes/${id}`);
  },

  /** Get a single route by ID */
  getById: async (id: string): Promise<ApiRoute> => {
    const { data } = await api.get<ApiRoute>(`/routes/${id}`);
    return data;
  },
};
