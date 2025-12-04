import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { fetchPublicAds, trackAdImpression, trackAdClick, Ad } from '@/api/adsApi'

export default function AdsCarousel() {
    const [ads, setAds] = useState<Ad[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        loadAds()
    }, [])

    const loadAds = async () => {
        try {
            const data = await fetchPublicAds()
            setAds(data)

            // Track impressions for all loaded ads
            data.forEach((ad: Ad) => {
                trackAdImpression(ad.id)
            })
        } catch (error) {
            console.error('Failed to load ads:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const nextSlide = useCallback(() => {
        if (ads.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % ads.length)
        }
    }, [ads.length])

    const prevSlide = useCallback(() => {
        if (ads.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)
        }
    }, [ads.length])

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index)
    }, [])

    // Auto-advance slides every 5 seconds
    useEffect(() => {
        if (ads.length <= 1 || isPaused) return

        const interval = setInterval(nextSlide, 5000)
        return () => clearInterval(interval)
    }, [ads.length, isPaused, nextSlide])

    const handleAdClick = (ad: Ad) => {
        trackAdClick(ad.id)
        if (ad.link_url) {
            window.open(ad.link_url, '_blank', 'noopener,noreferrer')
        }
    }

    // Get proper image URL (handles both local uploads and external URLs)
    const getImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl) return null
        // If it's already a full URL, use it as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl
        }
        // Otherwise, it's a local upload - prepend the backend URL
        return `http://localhost:3000${imageUrl}`
    }

    if (isLoading) {
        return (
            <div className="w-full h-96 md:h-[500px] bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 animate-pulse rounded-2xl relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{
                        animation: 'shimmer 2s linear infinite',
                    }}
                />
            </div>
        )
    }

    if (ads.length === 0) {
        return null
    }

    return (
        <div
            className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides */}
            <div className="relative w-full h-full">
                {ads.map((ad, index) => (
                    <div
                        key={ad.id}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentIndex
                                ? 'opacity-100 translate-x-0 scale-100 z-10'
                                : index < currentIndex
                                    ? 'opacity-0 -translate-x-full scale-95 z-0'
                                    : 'opacity-0 translate-x-full scale-95 z-0'
                            }`}
                        style={{
                            backgroundColor: ad.background_color || '#7C3AED',
                            color: ad.text_color || '#FFFFFF',
                        }}
                    >
                        {/* Background Image with Ken Burns effect */}
                        {ad.image_url && getImageUrl(ad.image_url) ? (
                            <div className="absolute inset-0 overflow-hidden">
                                <img
                                    src={getImageUrl(ad.image_url)!}
                                    alt={ad.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    style={{
                                        animation: 'kenBurns 20s ease-in-out infinite',
                                    }}
                                    onError={(e) => {
                                        // Hide image on error, show gradient background instead
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />
                                {/* Overlay for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
                            </div>
                        ) : (
                            /* Subtle gradient overlay when no image - using ad's background color */
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: `linear-gradient(135deg, ${ad.background_color || '#7C3AED'} 0%, ${ad.background_color || '#6D28D9'} 50%, ${ad.background_color || '#5B21B6'} 100%)`,
                                }}
                            />
                        )}

                        {/* Content */}
                        <div className="relative h-full flex items-center justify-center px-8 md:px-16 z-20">
                            <div className="max-w-4xl text-center space-y-6">
                                <h2 
                                    className="text-4xl md:text-6xl font-bold leading-tight"
                                    style={{
                                        animation: 'fadeInUp 0.6s ease-out forwards',
                                        color: ad.text_color || '#FFFFFF',
                                        textShadow: '2px 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    {ad.title}
                                </h2>

                                {ad.description && (
                                    <p 
                                        className="text-lg md:text-2xl max-w-2xl mx-auto"
                                        style={{
                                            animation: 'fadeInUp 0.6s ease-out 0.2s forwards',
                                            opacity: 0,
                                            color: ad.text_color || '#FFFFFF',
                                            textShadow: '1px 1px 4px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {ad.description}
                                    </p>
                                )}

                                {ad.link_url && (
                                    <button
                                        onClick={() => handleAdClick(ad)}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-110 transform group/btn"
                                        style={{
                                            animation: 'fadeInUp 0.6s ease-out 0.4s forwards',
                                            opacity: 0,
                                        }}
                                    >
                                        {ad.button_text || 'Learn More'}
                                        <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Floating decorative elements with infinite animations */}
                        <div 
                            className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"
                            style={{
                                animation: 'float 6s ease-in-out infinite',
                            }}
                        />
                        <div 
                            className="absolute top-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-2xl"
                            style={{
                                animation: 'float 6s ease-in-out 1s infinite',
                            }}
                        />
                        <div 
                            className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                            style={{
                                animation: 'float 6s ease-in-out 2s infinite',
                            }}
                        />
                        <div 
                            className="absolute bottom-20 left-20 w-28 h-28 bg-white/10 rounded-full blur-2xl"
                            style={{
                                animation: 'float 6s ease-in-out 3s infinite',
                            }}
                        />

                        {/* Sparkle effects */}
                        <div 
                            className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/60 rounded-full"
                            style={{
                                animation: 'sparkle 2s ease-in-out infinite',
                            }}
                        />
                        <div 
                            className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/60 rounded-full"
                            style={{
                                animation: 'sparkle 2s ease-in-out 1s infinite',
                            }}
                        />
                        <div 
                            className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white/60 rounded-full"
                            style={{
                                animation: 'sparkle 2s ease-in-out 2s infinite',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {ads.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110 transform z-30"
                        aria-label="Previous ad"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110 transform z-30"
                        aria-label="Next ad"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {ads.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                    {ads.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all ${index === currentIndex
                                    ? 'w-8 h-3 bg-white'
                                    : 'w-3 h-3 bg-white/50 hover:bg-white/75'
                                } rounded-full`}
                            aria-label={`Go to ad ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Ad Counter */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-sm font-medium z-30">
                {currentIndex + 1} / {ads.length}
            </div>
        </div>
    )
}
