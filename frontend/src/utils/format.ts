// Format price in Rwandan Francs
export const formatPrice = (price: number): string => {
    return `${price.toLocaleString('en-RW')} RF`
}

// Format number with commas
export const formatNumber = (num: number): string => {
    return num.toLocaleString('en-RW')
}
