/**
 * Centralized API Configuration
 * 
 * This file provides a single source of truth for the API base URL.
 * It reads from environment variables (VITE_API_BASE_URL) with fallbacks.
 * 
 * Usage:
 *   import { API_BASE } from '@/config/api'
 *   const response = await fetch(`${API_BASE}/products`)
 */

// Get API base URL from environment variable (Vite requires VITE_ prefix)
// Fallback to localhost for development if not set
const getApiBaseUrl = (): string => {
    // First, try to use the environment variable
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // Fallback: use hostname detection if env var is not set
    if (typeof window !== 'undefined') {
        const isLocalhost =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        return isLocalhost
            ? 'http://localhost:3000/api'
            : 'https://topdesign.lanari.rw/api';
    }

    // Default fallback for server-side rendering
    return 'http://localhost:3000/api';
};

// Export the API base URL constant
export const API_BASE = getApiBaseUrl();

// Export function for dynamic access if needed
export const getApiBase = () => API_BASE;
