// @ts-nocheck
import React from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from './router/routes'

import RouteGuard from './components/auth/RouteGuard'

function LegacyBusinessApp() {
  const element = useRoutes(routes)
  return (
    <RouteGuard>
      {element}
    </RouteGuard>
  )
}

export default LegacyBusinessApp
