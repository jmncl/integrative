import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart, removeItemFromCart } from '../../actions/cartActions'
import { peso } from '../../Utils/money'


const Cart = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.cart)
    const { user, isAuthenticated } = useSelector(state => state.auth)
    const navigate = useNavigate()
    const loggedIn = Boolean(isAuthenticated && user?.name)


    const increaseQty = (id, quantity, stock, size) => {
        const newQty = quantity + 1;
        if (newQty > stock) return;
        dispatch(addItemToCart(id, newQty, size))
    }

    const decreaseQty = (id, quantity, size) => {
        const newQty = quantity - 1;
        if (newQty <= 0) return;
        dispatch(addItemToCart(id, newQty, size))
    }

    const removeCartItemHandler = (id, size) => {
        dispatch(removeItemFromCart(id, size))
    }
    const checkoutHandler = () => {
        navigate('/login?redirect=shipping')
    }
    // localStorage.setItem('cartItems', JSON.stringify(cartItems))

    return (
        <>
            <MetaData title={'Your Cart'} />
            {!loggedIn ? (
                <div className="empty-note mt-5">Please log in first. <Link to="/login">Login</Link></div>
            ) : cartItems.length === 0 ? (
                <div className="empty-note mt-5">Your cart is empty. <Link to="/">Back to the shop</Link></div>
            ) : (
                <>
                    <h1 className="page-title mt-5">Your Cart: {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</h1>

                    <div className="row d-flex justify-content-between">
                        <div className="col-12 col-lg-8">

                            {cartItems.map(item => (
                                <div className="cart-item" key={`${item.product}-${item.size || ''}`}>
                                    <hr />
                                    <div className="row">
                                        <div className="col-4 col-lg-3">
                                            <img src={item.image} alt={item.name} height="90" width="115" />
                                        </div>

                                        <div className="col-5 col-lg-3">
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                            {item.size && <p className="card-category">Size {item.size}</p>}
                                        </div>

                                        <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                            <p id="card_item_price">{peso(item.price)}</p>
                                        </div>

                                        <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                            <div className="stockCounter d-inline">
                                                <span className="btn minus" onClick={() => decreaseQty(item.product, item.quantity, item.size)}>-</span>

                                                <input type="number" className="form-control count d-inline" value={item.quantity} readOnly />

                                                <span className="btn plus" onClick={() => increaseQty(item.product, item.quantity, item.stock, item.size)}>+</span>
                                            </div>
                                        </div>

                                        <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                                            <i id="delete_cart_item" className="fa fa-trash" onClick={() => removeCartItemHandler(item.product, item.size)} ></i>
                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>

                        <div className="col-12 col-lg-3 my-4">
                            <div id="order_summary">
                                <h4>Order Summary</h4>
                                <hr />
                                <p>Subtotal:  <span className="order-summary-values">{cartItems.reduce((acc, item) => (acc + Number(item.quantity)), 0)} (Units)</span></p>
                                <p>Est. total: <span className="order-summary-values">{peso(cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0))}</span></p>


                                <hr />
                                <button id="checkout_btn" className="btn btn-primary btn-block" onClick={checkoutHandler}>Check out</button>
                                {/*<button id="checkout_btn" className="btn btn-primary btn-block" >Check out</button>*/}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Cart