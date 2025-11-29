import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchJournalEntries } from '../../api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function JournalEntryDetailPage() {
  const { id } = useParams()
  const [journal, setJournal] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lines = [
    { id: 1, account: 'Accounts Receivable', debit: 450, credit: 0 },
    { id: 2, account: 'Sales Revenue', debit: 0, credit: 381.36 },
    { id: 3, account: 'VAT Payable', debit: 0, credit: 68.64 },
  ]

  useEffect(() => {
    if (!id) return

    let isMounted = true
    setLoading(true)
    setError(null)

    fetchJournalEntries()
      .then(entries => {
        if (!isMounted) return
        const found = (Array.isArray(entries) ? entries : []).find(
          (e: any) => String(e.id) === String(id)
        )
        if (!found) {
          setError('Journal entry not found')
        } else {
          setJournal(found)
        }
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load journal entry')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0)
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-sm text-gray-500">Loading journal entry...</p>
      </DashboardLayout>
    )
  }

  if (error || !journal) {
    return (
      <DashboardLayout>
        <p className="text-sm text-red-600">{error || 'Journal entry not found'}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Journal entry</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{journal.id}</h1>
          <p className="mt-2 text-sm text-gray-600">{journal.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Date</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{journal.date}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Total debit / credit</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {totalDebit} / {totalCredit}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-sm space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Lines</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Account</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Debit</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Credit</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => (
                <tr key={line.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{line.account}</td>
                  <td className="px-3 py-2 text-right text-gray-800">{line.debit || ''}</td>
                  <td className="px-3 py-2 text-right text-gray-800">{line.credit || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 space-y-1 text-right text-sm">
          <p className="text-gray-700">Total Debit: {totalDebit}</p>
          <p className="text-gray-700">Total Credit: {totalCredit}</p>
        </div>
      </section>
    </DashboardLayout>
  )
}
