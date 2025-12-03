import { getAuthToken } from '@/utils/apiClient'

const API_BASE = 'http://localhost:3000/api'

export interface Ad {
    id: number
    title: string
    description?: string
    image_url?: string
    link_url?: string
    button_text?: string
    background_color?: string
    text_color?: string
    start_date?: string
    end_date?: string
    is_active: boolean
    display_order: number
    impressions: number
    clicks: number
    created_by?: number
    created_by_name?: string
    created_at: string
    updated_at: string
}

// Public: Get active ads for display
export async function fetchPublicAds() {
    const res = await fetch(`${API_BASE}/ads/public`)

    if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to fetch ads')
    }

    return res.json()
}

// Public: Track ad impression
export async function trackAdImpression(adId: number | string) {
    try {
        await fetch(`${API_BASE}/ads/public/${adId}/impression`, {
            method: 'POST',
        })
    } catch (error) {
        // Silently fail for tracking
        console.error('Failed to track impression:', error)
    }
}

// Public: Track ad click
export async function trackAdClick(adId: number | string) {
    try {
        await fetch(`${API_BASE}/ads/public/${adId}/click`, {
            method: 'POST',
        })
    } catch (error) {
        // Silently fail for tracking
        console.error('Failed to track click:', error)
    }
}

// Get all ads for management
export async function fetchAds() {
    const token = getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE}/ads`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to fetch ads')
    }

    return res.json()
}

// Get single ad
export async function fetchAd(id: number | string) {
    const token = getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE}/ads/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to fetch ad')
    }

    return res.json()
}

// Create ad
export async function createAd(payload: Omit<Ad, 'id' | 'impressions' | 'clicks' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_name'>) {
    const token = getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE}/ads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create ad')
    }

    return data
}

// Update ad
export async function updateAd(id: number | string, payload: Partial<Omit<Ad, 'id' | 'impressions' | 'clicks' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_name'>>) {
    const token = getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update ad')
    }

    return data
}

// Delete ad
export async function deleteAd(id: number | string) {
    const token = getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to delete ad')
    }

    return data
}

// Toggle ad status
export async function toggleAdStatus(id: number | string) {
    const token = getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE}/ads/${id}/toggle`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to toggle ad status')
    }

    return data
}
