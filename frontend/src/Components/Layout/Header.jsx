import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Search from './Search'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../actions/userActions'

const Header = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)
    const navigate = useNavigate()
    const location = useLocation()
    const onLogin = location.pathname === '/login'
    const [menuOpen, setMenuOpen] = useState(false)

    const isAdmin = user?.role === 'admin'
    const loggedIn = Boolean(isAuthenticated && user?.name)

    const openCart = (event) => {
        if (loggedIn || loading) return
        event.preventDefault()
        toast.error('Please log in first', { position: 'bottom-right' })
        navigate('/login')
    }

    const logoutHandler = async () => {
        await dispatch(logout());
        toast.success('Logged out', {
            position: 'bottom-right'
        });
        navigate('/')
    }

    return (
        <nav className={isAdmin ? 'jt-nav jt-nav-admin' : 'navbar row jt-nav'}>
            <div className={isAdmin ? 'brand-slot' : 'col-12 col-md-3'}>
                <Link to={isAdmin ? '/dashboard' : '/'} className="brand">
                    <span className="brand-mark">J</span>
                    <span>
                        <strong>J-TRADE</strong>
                        <small>Jordan Brand</small>
                    </span>
                </Link>
            </div>
            {!isAdmin && !onLogin && (
                <div className="col-12 col-lg-5 mt-3 mt-lg-0">
                    <Search />
                </div>
            )}
            <div className={isAdmin ? 'nav-actions' : 'nav-actions col-12 col-lg-4'}>
                {user?.name && isAdmin ? (
                    <button className="nav-login" type="button" onClick={logoutHandler}>Logout</button>
                ) : user?.name ? (
                    <div className="user-menu">
                        <button type="button" className="nav-user" onClick={() => setMenuOpen(open => !open)}>
                            <figure className="avatar-nav">
                                {user.avatar?.url && <img src={user.avatar.url} alt={user.name} />}
                            </figure>
                            <span>{user.name}</span>
                        </button>
                        {menuOpen && (
                            <div className="dropdown-menu">
                                <Link className="dropdown-item" to="/offer" onClick={() => setMenuOpen(false)}>Sell or trade</Link>
                                <Link className="dropdown-item" to="/offers/me" onClick={() => setMenuOpen(false)}>My offers</Link>
                                <Link className="dropdown-item" to="/orders/me" onClick={() => setMenuOpen(false)}>Orders</Link>
                                <Link className="dropdown-item" to="/me" onClick={() => setMenuOpen(false)}>Profile</Link>
                                <button className="dropdown-item text-danger" type="button" onClick={logoutHandler}>Logout</button>
                            </div>
                        )}
                    </div>
                ) : !isAdmin && (
                    <Link to="/login" className="nav-login" id="login_btn">Login</Link>
                )}
                {!isAdmin && !onLogin && (
                    <Link to={loggedIn ? '/cart' : '/login'} className="nav-cart" onClick={openCart}>
                        <span id="cart">Cart</span>
                        <span id="cart_count">{loggedIn && cartItems ? cartItems.length : 0}</span>
                    </Link>
                )}
            </div>
        </nav>
    )
}

export default Header
