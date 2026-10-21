import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const CheckoutSteps = () => {
    const { pathname } = useLocation()
    const { shippingInfo } = useSelector(state => state.cart)
    const hasShipping = Boolean(shippingInfo && shippingInfo.address)
    const hasPayment = Boolean(sessionStorage.getItem('paymentMethod'))

    const steps = [
        { label: 'Shipping', to: '/shipping', open: true, here: pathname === '/shipping' },
        { label: 'Confirm Order', to: '/confirm', open: hasShipping || hasPayment || pathname === '/confirm', here: pathname === '/confirm' },
        { label: 'Payment', to: '/payment', open: hasPayment || pathname === '/payment', here: pathname === '/payment' }
    ]

    return (
        <div className="checkout-progress">
            {steps.map(step => {
                const className = `step ${step.open || step.here ? 'active-step' : 'incomplete'}`
                const pill = <div className={className}>{step.label}</div>
                if (!step.open) {
                    return <span key={step.label} className="step-link">{pill}</span>
                }
                return (
                    <Link key={step.label} to={step.to} className="step-link">
                        {pill}
                    </Link>
                )
            })}
        </div>
    )
}

export default CheckoutSteps
