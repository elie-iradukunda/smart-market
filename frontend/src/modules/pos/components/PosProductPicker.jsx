import React, { useEffect, useState } from 'react';
import { fetchMaterials } from '../../../api/apiClient';

export default function PosProductPicker({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    fetchMaterials()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load products');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h2 className="text-lg font-medium">Quick Products</h2>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-3 text-xs text-gray-500">Loading products...</p>
      ) : (
        <div className="mt-3 grid gap-2 text-sm">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd && onAdd(p)}
              className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-left hover:bg-gray-50"
            >
              <span className="text-gray-800">{p.name || p.material_name || p.sku}</span>
              <span className="text-gray-700">{p.price != null ? `RF ${p.price}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
