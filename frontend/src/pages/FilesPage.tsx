import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FolderOpen } from 'lucide-react'

export default function FilesPage() {
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Files</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage and access shared documents and resources.
                            </p>
                        </div>
                    </div>

                    {/* Content Placeholder */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 mb-6">
                            <FolderOpen className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No files uploaded yet</h3>
                        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                            Shared documents and resources will appear here.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
