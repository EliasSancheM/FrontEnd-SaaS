import axios from 'axios';

/**
 * Cliente HTTP Axios configurado para interactuar de forma segura
 * con la API de Laravel (Sanctum/Tokens)
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Requerido para almacenar/enviar cookies HTTPOnly de Laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para inyectar dinámicamente el Token Sanctum Bearer de localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar automáticamente errores globales de Auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Redirigir al login si el token expira o es inválido
      localStorage.removeItem('auth_token');
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      window.location.href = `${basePath}/login`;
    }
    return Promise.reject(error);
  }
);
