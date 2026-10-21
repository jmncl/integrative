import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { useSelector } from 'react-redux'
import { peso } from '../../Utils/money'

const ConfirmOrder = () => {
    const navigate = useNavigate()
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)
    const [paymentMethod, setPaymentMethod] = useState(sessionStorage.getItem('paymentMethod') || 'cash')
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shippingPrice = itemsPrice > 1000 ? 0 : 80
    const taxPrice = Number((0.12 * itemsPrice).toFixed(2))
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2)

    sessionStorage.setItem('orderInfo', JSON.stringify({
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice,
        taxPrice,
        totalPrice,
        paymentMethod
    }))
    sessionStorage.setItem('paymentMethod', paymentMethod)

    const processToPayment = () => {
        navigate('/payment')
    }

    return (
        <>
            <MetaData title={'Confirm Order'} />
            <CheckoutSteps />
            <div className="row d-flex justify-content-between">
                <div className="col-12 col-lg-8 mt-5 order-confirm">
                    <h4 className="mb-3">Shipping Info</h4>
                    {user && <p><b>Name:</b> {user.name}</p>}
                    <p><b>Phone:</b> {shippingInfo.phoneNo}</p>
                    <p className="mb-4"><b>Address:</b> {`${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`}</p>

                    <hr />
                    <h4 className="mt-4">Your Cart Items:</h4>

                    {cartItems.map(item => (
                        <div className="cart-item my-1" key={item.product}>
                            <hr />
                            <div className="row">
                                <div className="col-4 col-lg-2">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="col-5 col-lg-6">
                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                </div>
                                <div className="col-4 col-lg-4 mt-4 mt-lg-0">
                                    <p>{item.quantity} x {peso(item.price)} = <b>{peso(item.quantity * item.price)}</b>{item.size ? ` · Size ${item.size}` : ''}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-12 col-lg-3 my-4">
                    <div id="order_summary">
                        <h4>Order Summary</h4>
                        <hr />
                        <p>Subtotal:  <span className="order-summary-values">{peso(itemsPrice)}</span></p>
                        <p>Shipping: <span className="order-summary-values">{peso(shippingPrice)}</span></p>
                        <p>VAT 12%:  <span className="order-summary-values">{peso(taxPrice)}</span></p>
                        <hr />
                        <p>Total: <span className="order-summary-values">{peso(totalPrice)}</span></p>
                        <hr />
                        <p className="mb-2"><b>Pay with</b></p>
                        <label className="pay-choice">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={() => setPaymentMethod('cash')}
                            />
                            Cash
                        </label>
                        <label className="pay-choice">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={() => setPaymentMethod('card')}
                            />
                            Card
                        </label>
                        <button id="checkout_btn" className="btn btn-primary btn-block mt-3" onClick={processToPayment}>
                            {paymentMethod === 'cash' ? 'Continue with cash' : 'Proceed to card payment'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConfirmOrder
