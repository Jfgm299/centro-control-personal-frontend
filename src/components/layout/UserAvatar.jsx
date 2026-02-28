import { useAuthStore } from '../../store/authStore'

export default function UserAvatar() {
  const { user } = useAuthStore()

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'CC'

  return (
    <div className="fixed top-4 right-6 z-50">
      <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}>
            {initials}
          </div>
        )}
      </button>
    </div>
  )
}