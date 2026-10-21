import { Navigate } from 'react-router-dom'
import Loader from '../Layout/Loader'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const { isAuthenticated, loading, user } = useSelector(state => state.auth)

    if (loading !== false) return <Loader />
    if (!isAuthenticated) return <Navigate to="/login" />
    if (isAdmin && user?.role !== 'admin') return <Navigate to="/" />
    return children
}

export default ProtectedRoute
