// @ts-nocheck
import React from 'react'

export default function DemandForecastChart({ data }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 mb-2">Demand forecast</p>
      <ul className="space-y-1 text-xs">
        {data.map(item => (
          <li key={item.category + item.month} className="flex justify-between text-gray-700">
            <span>{item.category} - {item.month}</span>
            <span>{item.expectedJobs} jobs</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
