/**
 * Image URL Helper
 * 
 * Converts relative image paths to full URLs using the API base URL
 * 
 * Usage:
 *   import { getImageUrl } from '@/utils/imageUrl'
 *   const fullUrl = getImageUrl('/uploads/products/image.jpg')
 */

import { API_BASE } from '@/config/api'

/**
 * Get full image URL from a relative path
 * @param path - Relative image path (e.g., '/uploads/products/image.jpg')
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string): string => {
    if (!path) return ''
    if (path.startsWith('http')) return path

    // Extract base URL from API_BASE (remove '/api')
    const baseUrl = API_BASE.replace('/api', '') || 'https://topdesign.lanari.rw'
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    return `${baseUrl}${cleanPath}`
}
