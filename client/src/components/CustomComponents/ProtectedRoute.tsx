import { Navigate, Outlet } from 'react-router-dom'
import useUserStore from '@/store/userStore'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { token, user } = useUserStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If they are a captain and not allowed here, send them to captain view
    if (user.role === 'captain') {
      return <Navigate to="/captain" replace />
    }
    // Otherwise send to command center dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
