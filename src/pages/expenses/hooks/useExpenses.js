import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'

/**
 * Fetches all expenses using React Query.
 * - Caché de 5 min (staleTime heredado del QueryClient global)
 * - Refetch automático al volver a la pestaña
 * - Estados loading/error listos para usar
 */
export function useExpenses() {
  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/expenses/')
      return data
    },
  })

  return {
    expenses,
    isLoading,
    error: error ? (error.response?.data?.detail ?? error.message) : null,
  }
}

/**
 * Returns aggregated analytics from a list of expenses.
 * Pure function — no side effects, easy to test.
 */
export function aggregateExpenses(expenses) {
  if (!expenses.length) return null

  const byMonth = {}
  for (const expense of expenses) {
    const date = new Date(expense.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth[monthKey]) byMonth[monthKey] = []
    byMonth[monthKey].push(expense)
  }

  const getWeekOfMonth = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    return Math.ceil((date.getDate() + startOfMonth.getDay()) / 7)
  }

  const monthlyData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, items]) => {
      const [year, month] = monthKey.split('-').map(Number)
      const label = new Date(year, month - 1, 1).toLocaleDateString('default', { month: 'short', year: '2-digit' })

      const byAccount = {}
      for (const item of items) {
        byAccount[item.account] = (byAccount[item.account] || 0) + item.quantity
      }

      const byWeek = {}
      for (const item of items) {
        const date = new Date(item.created_at)
        const week = getWeekOfMonth(date)
        const weekKey = `W${week}`
        if (!byWeek[weekKey]) byWeek[weekKey] = { label: weekKey, total: 0, byAccount: {} }
        byWeek[weekKey].total += item.quantity
        byWeek[weekKey].byAccount[item.account] = (byWeek[weekKey].byAccount[item.account] || 0) + item.quantity
      }

      const total = items.reduce((sum, i) => sum + i.quantity, 0)
      const daysInMonth = new Set(items.map(i => i.created_at.slice(0, 10))).size

      return {
        monthKey,
        label,
        total,
        byAccount,
        avgPerDay: daysInMonth > 0 ? total / daysInMonth : 0,
        count: items.length,
        weeks: Object.values(byWeek).sort((a, b) => a.label.localeCompare(b.label)),
      }
    })

  return { monthlyData, accounts: [...new Set(expenses.map(e => e.account))] }
}