import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useScheduledExpenses() {
  const { data: scheduled = [], isLoading, error } = useQuery({
    queryKey: ['scheduled-expenses'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/expenses/scheduled')
      return data
    },
  })
  return { scheduled, isLoading, error: error ? (error.response?.data?.detail ?? error.message) : null }
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

export function aggregateScheduled(scheduled) {
  // Solo suscripciones activas para el cálculo mensual
  const activeSubs = scheduled.filter(s => s.is_active && s.category === 'SUBSCRIPTION')

  const monthlyTotal = activeSubs.reduce((sum, s) => {
    switch (s.frequency?.toUpperCase()) {
      case 'MONTHLY': return sum + s.amount
      case 'YEARLY':  return sum + s.amount / 12
      case 'WEEKLY':  return sum + s.amount * 4.33
      default:        return sum
    }
  }, 0)

  const yearlyTotal = monthlyTotal * 12

  const upcoming = [...scheduled]
    .filter(s => s.next_payment_date && s.is_active)
    .sort((a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date))
    .slice(0, 5)

  return { monthlyTotal, yearlyTotal, upcoming, activeCount: activeSubs.length }
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}