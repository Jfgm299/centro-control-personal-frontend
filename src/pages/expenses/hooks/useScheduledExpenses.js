import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useScheduledExpenses() {
  const { data: scheduled = [], isLoading, error } = useQuery({
    queryKey: ['scheduled-expenses'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/expenses/scheduled')
      return data
    },
  })

  return {
    scheduled,
    isLoading,
    error: error ? (error.response?.data?.detail ?? error.message) : null,
  }
}

export function useScheduledMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['scheduled-expenses'] })

  const create = useMutation({
    mutationFn: (body) => api.post('/api/v1/expenses/scheduled', body).then(r => r.data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/api/v1/expenses/scheduled/${id}`, body).then(r => r.data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/expenses/scheduled/${id}`),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

// ── Helpers de cálculo ────────────────────────────────────────────────────────

export function aggregateScheduled(scheduled) {
  const active = scheduled.filter(s => s.is_active)

  const monthlyTotal = active.reduce((sum, s) => {
    switch (s.frequency) {
      case 'monthly':  return sum + s.amount
      case 'yearly':   return sum + s.amount / 12
      case 'weekly':   return sum + s.amount * 4.33
      case 'custom':   return sum + (s.custom_days ? s.amount * (30 / s.custom_days) : 0)
      default:         return sum
    }
  }, 0)

  const yearlyTotal = monthlyTotal * 12

  const upcoming = [...active]
    .filter(s => s.next_payment_date)
    .sort((a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date))
    .slice(0, 5)

  const byCategory = active.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + (
      s.frequency === 'monthly' ? s.amount :
      s.frequency === 'yearly'  ? s.amount / 12 :
      s.frequency === 'weekly'  ? s.amount * 4.33 : s.amount
    )
    return acc
  }, {})

  return { monthlyTotal, yearlyTotal, upcoming, byCategory, activeCount: active.length }
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const FREQUENCY_LABELS = {
  monthly:  'Mensual',
  yearly:   'Anual',
  weekly:   'Semanal',
  custom:   'Personalizado',
}

export const CATEGORY_LABELS = {
  subscription: 'Suscripción',
  recurring:    'Gasto recurrente',
  installment:  'Cuota / Plazo',
}

export const CATEGORY_COLORS = {
  subscription: '#6366f1',
  recurring:    '#f59e0b',
  installment:  '#10b981',
}