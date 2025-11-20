// @ts-nocheck
import React from 'react'

export default function ReorderSuggestionList({ data }) {
  const suggestions = data || []

  return (
    <div>
      <p className="text-sm font-medium text-gray-900 mb-2">Reorder suggestions</p>
      <ul className="space-y-1 text-xs">
        {suggestions.map(s => (
          <li key={s.item || s.name || s.sku} className="flex justify-between text-gray-700">
            <span>{s.item || s.name || s.sku}</span>
            <span>{s.priority || s.reorder_status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
