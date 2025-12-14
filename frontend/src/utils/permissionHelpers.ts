/**
 * Permission helper utilities for consistent permission checking across the app
 */

import { currentUserHasPermission, getAuthUser } from './apiClient'

/**
 * Common permission checks for CRUD operations
 */
export const PermissionHelpers = {
  // Check if user can create a resource
  canCreate: (resource: string): boolean => {
    const user = getAuthUser()
    if (user?.is_super_admin || user?.role_id === 1) return true
    return currentUserHasPermission(`${resource}.create`)
  },

  // Check if user can view a resource
  canView: (resource: string): boolean => {
    const user = getAuthUser()
    if (user?.is_super_admin || user?.role_id === 1) return true
    return currentUserHasPermission(`${resource}.view`)
  },

  // Check if user can update/edit a resource
  canUpdate: (resource: string): boolean => {
    const user = getAuthUser()
    if (user?.is_super_admin || user?.role_id === 1) return true
    return currentUserHasPermission(`${resource}.update`) || currentUserHasPermission(`${resource}.manage`)
  },

  // Check if user can delete a resource
  canDelete: (resource: string): boolean => {
    const user = getAuthUser()
    if (user?.is_super_admin || user?.role_id === 1) return true
    return currentUserHasPermission(`${resource}.delete`) || currentUserHasPermission(`${resource}.manage`)
  },

  // Check if user can manage (full CRUD) a resource
  canManage: (resource: string): boolean => {
    const user = getAuthUser()
    if (user?.is_super_admin || user?.role_id === 1) return true
    return currentUserHasPermission(`${resource}.manage`)
  },
}

/**
 * Permission mapping for common resources
 */
export const RESOURCE_PERMISSIONS: Record<string, {
  create: string
  view: string
  update: string
  delete: string
  manage?: string
}> = {
  customer: {
    create: 'customer.create',
    view: 'customer.view',
    update: 'customer.update',
    delete: 'customer.manage',
    manage: 'customer.manage',
  },
  lead: {
    create: 'lead.create',
    view: 'lead.view',
    update: 'lead.manage',
    delete: 'lead.manage',
    manage: 'lead.manage',
  },
  quote: {
    create: 'quote.create',
    view: 'quote.view',
    update: 'quote.manage',
    delete: 'quote.manage',
    manage: 'quote.manage',
  },
  order: {
    create: 'order.create',
    view: 'order.view',
    update: 'order.update',
    delete: 'order.manage',
    manage: 'order.manage',
  },
  workorder: {
    create: 'workorder.create',
    view: 'workorder.view',
    update: 'workorder.update',
    delete: 'workorder.manage',
    manage: 'workorder.manage',
  },
  material: {
    create: 'material.create',
    view: 'material.view',
    update: 'material.create',
    delete: 'inventory.manage',
    manage: 'inventory.manage',
  },
  invoice: {
    create: 'invoice.create',
    view: 'invoice.view',
    update: 'invoice.create',
    delete: 'invoice.create',
    manage: 'invoice.create',
  },
  payment: {
    create: 'payment.create',
    view: 'payment.view',
    update: 'payment.create',
    delete: 'payment.refund',
    manage: 'payment.create',
  },
  campaign: {
    create: 'campaign.create',
    view: 'campaign.view',
    update: 'campaign.update',
    delete: 'campaign.manage',
    manage: 'campaign.manage',
  },
  user: {
    create: 'user.create',
    view: 'user.view',
    update: 'user.manage',
    delete: 'user.manage',
    manage: 'user.manage',
  },
  role: {
    create: 'role.manage',
    view: 'role.manage',
    update: 'role.manage',
    delete: 'role.manage',
    manage: 'role.manage',
  },
}

