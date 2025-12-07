import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Product } from '@/contexts/CartContext'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Package, Eye, Share2, Facebook, Twitter, MessageCircle, Linkedin, Copy, Check } from 'lucide-react'
import { toast } from 'react-toastify'

interface ProductCardProps {
    product: Product
}

// Helper to get full image URL
const getImageUrl = (path: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `http://localhost:3000${cleanPath}`
}

// Helper to create combined image with text overlay
const createImageWithText = async (
    imageUrl: string, 
    productName: string, 
    description: string,
    productUrl: string,
    phoneNumber: string = '+250 788 123 456'
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Could not get canvas context'))
                return
            }
            
            // Canvas dimensions - optimized for social media (1200x630 is ideal for Open Graph)
            const width = 1200
            const height = 630
            canvas.width = width
            canvas.height = height
            
            // Draw image background (cover the entire canvas)
            ctx.drawImage(img, 0, 0, width, height)
            
            // Add stronger dark overlay for better text readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
            ctx.fillRect(0, 0, width, height)
            
            // Add stronger gradient overlay from bottom (more opaque) - extended for phone/URL
            const gradient = ctx.createLinearGradient(0, height - 320, 0, height)
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)')
            gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.6)')
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)')
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)')
            ctx.fillStyle = gradient
            ctx.fillRect(0, height - 320, width, 320)
            
            // Text styling
            ctx.textAlign = 'left'
            ctx.textBaseline = 'bottom'
            
            // Product name (larger, bold, bright white with shadow for visibility)
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
            ctx.shadowBlur = 8
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2
            ctx.fillStyle = '#FFFFFF'
            ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            const nameY = height - 140
            const maxNameWidth = width - 80
            
            // Wrap product name if too long
            let nameLines = []
            const words = productName.split(' ')
            let currentLine = ''
            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word
                const metrics = ctx.measureText(testLine)
                if (metrics.width > maxNameWidth && currentLine) {
                    nameLines.push(currentLine)
                    currentLine = word
                } else {
                    currentLine = testLine
                }
            }
            if (currentLine) nameLines.push(currentLine)
            
            // Draw product name (up to 2 lines)
            nameLines.slice(0, 2).forEach((line, index) => {
                ctx.fillText(line, 40, nameY - (index * 65), maxNameWidth)
            })
            
            // Description (smaller, below name, bright white)
            if (description) {
                ctx.font = '26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                ctx.fillStyle = '#FFFFFF'
                
                // Wrap description
                const maxDescWidth = width - 80
                const descWords = description.split(' ')
                let descLines = []
                let currentDescLine = ''
                
                for (const word of descWords) {
                    const testLine = currentDescLine ? `${currentDescLine} ${word}` : word
                    const metrics = ctx.measureText(testLine)
                    if (metrics.width > maxDescWidth && currentDescLine) {
                        descLines.push(currentDescLine)
                        currentDescLine = word
                    } else {
                        currentDescLine = testLine
                    }
                }
                if (currentDescLine) descLines.push(currentDescLine)
                
                // Draw description (up to 2 lines)
                const descStartY = nameY - (nameLines.length * 65) - 25
                descLines.slice(0, 2).forEach((line, index) => {
                    ctx.fillText(line, 40, descStartY - (index * 38), maxDescWidth)
                })
            }
            
            // Contact info section (Phone and URL) - at the very bottom
            ctx.shadowBlur = 8
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2
            
            // Phone number (bright gold/yellow for high visibility) - left side
            ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            ctx.fillStyle = '#FFD700' // Bright gold/yellow for high visibility
            const phoneY = height - 15
            ctx.fillText(`📞 ${phoneNumber}`, 40, phoneY)
            
            // Product URL (bright cyan/blue for visibility) - right side
            ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            ctx.fillStyle = '#00D9FF' // Bright cyan for high visibility
            const urlY = height - 15
            // Shorten URL for display if too long
            let displayUrl = productUrl
            if (displayUrl.length > 40) {
                displayUrl = displayUrl.substring(0, 37) + '...'
            }
            const urlText = `🔗 ${displayUrl}`
            const urlWidth = ctx.measureText(urlText).width
            ctx.fillText(urlText, width - urlWidth - 40, urlY)
            
            // Reset shadow
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `product-share-${Date.now()}.png`, { type: 'image/png' })
                    resolve(file)
                } else {
                    reject(new Error('Failed to create image blob'))
                }
            }, 'image/png', 0.95)
        }
        
        img.onerror = () => {
            reject(new Error('Failed to load image'))
        }
        
        img.src = imageUrl
    })
}

// Category color mapping for better visual distinction
const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        'Banners': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
        'Printing': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
        'Design': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
        'Garments': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
        'Signage': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
        'Promotional': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    }
    return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart()
    const navigate = useNavigate()
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [copied, setCopied] = useState(false)
    const shareMenuRef = useRef<HTMLDivElement>(null)
    const categoryColors = getCategoryColor(product.category || 'Other')
    const hasImage = product.image && !imageError
    const imageUrl = getImageUrl(product.image || '')
    const productUrl = `${window.location.origin}/products/${product.id}`
    const shareText = `${product.name}${product.description ? ` - ${product.description}` : ' - Check out this amazing product!'}`
    const companyPhone = '+250 788 123 456' // Company phone number - update this with your actual phone

    const handleAddToCart = () => {
        addToCart(product)
        toast.success(`${product.name} added to cart!`, {
            position: 'bottom-right',
            autoClose: 2000,
        })
    }

    const handleViewDetails = () => {
        navigate(`/products/${product.id}`)
    }

    const handleImageError = () => {
        setImageError(true)
        setImageLoading(false)
    }

    const handleImageLoad = () => {
        setImageLoading(false)
    }

    // Close share menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false)
            }
        }

        if (showShareMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showShareMenu])

    const handleShareFacebook = async () => {
        // Try to share combined image (image + caption) via native share first
        if (navigator.share && imageUrl) {
            try {
                toast.info('Creating image with caption...', { autoClose: 2000 })
                
                // Create combined image (product image + caption text + URL + phone)
                const combinedImageFile = await createImageWithText(
                    imageUrl,
                    product.name,
                    product.description || 'Check out this amazing product!',
                    productUrl,
                    companyPhone
                )
                
                // Try native share with combined image
                if (navigator.canShare && navigator.canShare({ files: [combinedImageFile] })) {
                    await navigator.share({
                        title: product.name,
                        text: shareText,
                        url: productUrl,
                        files: [combinedImageFile]
                    })
                    setShowShareMenu(false)
                    toast.success('Sharing combined image with caption...')
                    return
                }
            } catch (err) {
                console.log('Could not create/share combined image:', err)
            }
        }
        
        // Fallback: Facebook Share Dialog (uses Open Graph tags)
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
        window.open(shareUrl, '_blank', 'width=600,height=500')
        setShowShareMenu(false)
        
        if (productUrl.includes('localhost')) {
            toast.info('Note: On localhost, Facebook cannot fetch the image. In production, the image will appear automatically.', {
                autoClose: 5000
            })
        } else {
            toast.success('Opening Facebook share... Image and details will appear automatically.')
        }
    }

    const handleShareTwitter = async () => {
        // Try to share combined image (image + caption) via native share first
        if (navigator.share && imageUrl) {
            try {
                toast.info('Creating image with caption...', { autoClose: 2000 })
                
                // Create combined image (product image + caption text + URL + phone)
                const combinedImageFile = await createImageWithText(
                    imageUrl,
                    product.name,
                    product.description || 'Check out this amazing product!',
                    productUrl,
                    companyPhone
                )
                
                // Try native share with combined image
                if (navigator.canShare && navigator.canShare({ files: [combinedImageFile] })) {
                    await navigator.share({
                        title: product.name,
                        text: shareText,
                        url: productUrl,
                        files: [combinedImageFile]
                    })
                    setShowShareMenu(false)
                    toast.success('Sharing combined image with caption...')
                    return
                }
            } catch (err) {
                console.log('Could not create/share combined image:', err)
            }
        }
        
        // Fallback: Twitter Share (uses Twitter Card meta tags)
        const text = `${shareText} ${productUrl}`
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`
        window.open(url, '_blank', 'width=600,height=400')
        setShowShareMenu(false)
        toast.success('Opening Twitter share...')
    }

    const handleShareWhatsApp = async () => {
        // Create combined image with text overlay
        if (imageUrl && navigator.share) {
            try {
                toast.info('Creating image with caption...', { autoClose: 2000 })
                
                // Create combined image (product image + caption text + URL + phone)
                const combinedImageFile = await createImageWithText(
                    imageUrl,
                    product.name,
                    product.description || 'Check out this amazing product!',
                    productUrl,
                    companyPhone
                )
                
                // Try to share the combined image
                if (navigator.canShare && navigator.canShare({ files: [combinedImageFile] })) {
                    await navigator.share({
                        title: product.name,
                        text: shareText,
                        url: productUrl,
                        files: [combinedImageFile] // Combined image with text overlay
                    })
                    setShowShareMenu(false)
                    toast.success('Sharing combined image with caption...')
                    return
                }
            } catch (err) {
                console.log('Could not create/share combined image:', err)
                toast.warning('Could not create combined image, falling back to text share')
            }
        }
        
        // Fallback for WhatsApp Web: Share URL with caption text
        const caption = product.description || 'Check out this amazing product!'
        const text = `${product.name}\n\n${caption}\n\n${productUrl}`
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
        setShowShareMenu(false)
        toast.info('Opening WhatsApp...')
    }

    const handleShareLinkedIn = () => {
        // LinkedIn will fetch the image from Open Graph tags
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`
        window.open(url, '_blank', 'width=600,height=400')
        setShowShareMenu(false)
        toast.success('Opening LinkedIn share...')
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(productUrl)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => {
                setCopied(false)
                setShowShareMenu(false)
            }, 1500)
        } catch (err) {
            toast.error('Failed to copy link')
        }
    }

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                // Create combined image with text overlay (image + caption as one file)
                let files: File[] = []
                
                if (imageUrl && navigator.canShare) {
                    try {
                        toast.info('Creating image with caption...', { autoClose: 2000 })
                        
                        // Create combined image (product image + caption text + URL + phone)
                        const combinedImageFile = await createImageWithText(
                            imageUrl,
                            product.name,
                            product.description || 'Check out this amazing product!',
                            productUrl,
                            companyPhone
                        )
                        
                        // Check if we can share files
                        if (navigator.canShare({ files: [combinedImageFile] })) {
                            files = [combinedImageFile]
                        }
                    } catch (err) {
                        console.log('Could not create combined image:', err)
                        toast.warning('Could not create combined image, sharing URL only')
                    }
                }
                
                // Prepare share data - combined image already includes caption
                const shareData: ShareData = {
                    title: product.name,
                    text: shareText, // Additional text (some platforms show this too)
                    url: productUrl,
                    ...(files.length > 0 && { files }) // Combined image with text overlay
                }
                
                await navigator.share(shareData)
                setShowShareMenu(false)
                if (files.length > 0) {
                    toast.success('Sharing combined image with caption...')
                } else {
                    toast.success('Shared! Image and caption will appear when URL is opened.')
                }
            } catch (err: any) {
                // User cancelled or error occurred
                if (err.name !== 'AbortError') {
                    console.log('Share error:', err)
                    // Fallback to copy link
                    handleCopyLink()
                }
            }
        } else {
            // Fallback to copy link if native share is not available
            handleCopyLink()
        }
    }

    return (
        <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {hasImage && imageUrl ? (
                    <>
                        {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                            loading="lazy"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                                <Package className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Badge - Enhanced Design */}
                <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border text-xs font-semibold rounded-full shadow-md backdrop-blur-sm`}>
                        <div className={`w-2 h-2 rounded-full ${categoryColors.text.replace('text-', 'bg-')}`} />
                        {product.category || 'Uncategorized'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    {/* Share Button */}
                    <div className="relative" ref={shareMenuRef}>
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 group/share"
                            aria-label="Share product"
                        >
                            <Share2 className="w-5 h-5 text-gray-700 group-hover/share:text-blue-600 transition-colors" />
                        </button>

                        {/* Share Dropdown Menu */}
                        {showShareMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                {navigator.share && (
                                    <button
                                        onClick={handleNativeShare}
                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">Share via...</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleShareFacebook}
                                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                >
                                    <Facebook className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-700">Facebook</span>
                                </button>
                                <button
                                    onClick={handleShareTwitter}
                                    className="w-full px-4 py-2.5 text-left hover:bg-sky-50 flex items-center gap-3 transition-colors"
                                >
                                    <Twitter className="w-4 h-4 text-sky-500" />
                                    <span className="text-sm text-gray-700">Twitter/X</span>
                                </button>
                                <button
                                    onClick={handleShareWhatsApp}
                                    className="w-full px-4 py-2.5 text-left hover:bg-green-50 flex items-center gap-3 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-700">WhatsApp</span>
                                </button>
                                <button
                                    onClick={handleShareLinkedIn}
                                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                >
                                    <Linkedin className="w-4 h-4 text-blue-700" />
                                    <span className="text-sm text-gray-700">LinkedIn</span>
                                </button>
                                <div className="border-t border-gray-200 my-1" />
                                <button
                                    onClick={handleCopyLink}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-600">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm text-gray-700">Copy Link</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* View Details Button - Eye Icon */}
                    <button
                        onClick={handleViewDetails}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 group/eye"
                        aria-label="View product details"
                    >
                        <Eye className="w-5 h-5 text-gray-700 group-hover/eye:text-blue-600 transition-colors" />
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {product.description}
                </p>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900">
                            {product.price.toLocaleString('en-RW')} RF
                        </span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">Add to Cart</span>
                    </button>
                </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 border-2 border-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    )
}
