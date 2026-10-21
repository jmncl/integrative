import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const CustomerRoute = ({ children }) => {
    const { user } = useSelector(state => state.auth)

    if (user?.role === 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default CustomerRoute
