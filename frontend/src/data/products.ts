import { Product } from '@/contexts/CartContext'
import { API_BASE } from '@/config/api'

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        return data.map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
            description: item.description,
            price: Number(item.price),
            image: item.image,
            category: item.category,
            stock_quantity: item.stock_quantity
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Keep a fallback empty array or initial state if needed, but fetchProducts will handle it.
export const products: Product[] = [];
