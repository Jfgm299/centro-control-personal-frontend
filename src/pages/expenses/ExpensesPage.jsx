import { useIsMobile } from '../../hooks/useIsMobile'
import ExpensesPageMobile from './ExpensesPageMobile'
import ExpensesPageDesktop from './ExpensesPageDesktop'

export default function ExpensesPage() {
  const isMobile = useIsMobile()
  return isMobile ? <ExpensesPageMobile /> : <ExpensesPageDesktop />
}