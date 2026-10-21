import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'

const OrderSuccess = () => {
    sessionStorage.clear();
    // localStorage.clear();
    // sessionStorage.removeItem()
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingInfo');
    return (
        <>

            <MetaData title={'Order Success'} />

            <div className="profile-page">
                <div className="profile-card success-card">
                    <h1 className="page-title">Order placed</h1>
                    <p>Your order has been placed. You can check it under My Orders.</p>
                    <Link to="/orders/me" className="btn">Go to orders</Link>
                </div>
            </div>

        </>
    )
}

export default OrderSuccess