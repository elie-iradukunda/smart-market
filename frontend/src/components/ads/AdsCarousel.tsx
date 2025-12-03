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

    if (isLoading) {
        return (
            <div className="w-full h-96 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-2xl" />
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
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentIndex
                            ? 'opacity-100 translate-x-0 scale-100'
                            : index < currentIndex
                                ? 'opacity-0 -translate-x-full scale-95'
                                : 'opacity-0 translate-x-full scale-95'
                            }`}
                        style={{
                            backgroundColor: ad.background_color || '#4F46E5',
                            color: ad.text_color || '#FFFFFF',
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />

                        {/* Background Image */}
                        {ad.image_url && (
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-30"
                                style={{ backgroundImage: `url(${ad.image_url})` }}
                            />
                        )}

                        {/* Content */}
                        <div className="relative h-full flex items-center justify-center px-8 md:px-16">
                            <div className="max-w-4xl text-center space-y-6 animate-fade-in-up">
                                <h2 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">
                                    {ad.title}
                                </h2>

                                {ad.description && (
                                    <p className="text-lg md:text-2xl opacity-90 max-w-2xl mx-auto drop-shadow-md">
                                        {ad.description}
                                    </p>
                                )}

                                {ad.link_url && (
                                    <button
                                        onClick={() => handleAdClick(ad)}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform group/btn"
                                    >
                                        {ad.button_text || 'Learn More'}
                                        <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-blob" />
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {ads.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110 transform"
                        aria-label="Previous ad"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110 transform"
                        aria-label="Next ad"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {ads.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
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
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {currentIndex + 1} / {ads.length}
            </div>
        </div>
    )
}
