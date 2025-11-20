// @ts-nocheck
import React from 'react'

export default function PriceRecommendationWidget({ data }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 mb-2">Price recommendations (demo)</p>
      <ul className="space-y-1 text-xs">
        {data.map(item => (
          <li key={item.item} className="flex justify-between text-gray-700">
            <span>{item.item}</span>
            <span>{item.currentPrice} → {item.suggestedPrice}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
