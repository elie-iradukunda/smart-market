// @ts-nocheck
import React from 'react'
import { Navigate } from 'react-router-dom'

// POS dashboard is now merged into the Sales dashboard. This component simply redirects.
export default function PosDashboard() {
  return <Navigate to="/dashboard/sales" replace />
}
