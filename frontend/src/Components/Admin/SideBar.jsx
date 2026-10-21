import { NavLink, useLocation } from 'react-router-dom'

const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/reviews', label: 'Reviews' },
    { to: '/admin/offers', label: 'Offers' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/users', label: 'Users' }
]

const Sidebar = () => {
    const { pathname } = useLocation()

    return (
        <nav className="admin-nav" aria-label="Admin">
            {links.map(link => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to !== '/admin/products'}
                    className={link.to === '/admin/products'
                        ? () => (pathname.startsWith('/admin/product') ? 'active' : '')
                        : undefined}
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    )
}

export default Sidebar
