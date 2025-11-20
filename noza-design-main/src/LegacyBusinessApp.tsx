// @ts-nocheck
import React from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from './router/routes'

function LegacyBusinessApp() {
  const element = useRoutes(routes)
  return element
}

export default LegacyBusinessApp
