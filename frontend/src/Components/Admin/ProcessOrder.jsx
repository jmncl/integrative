import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, updateOrder, clearErrors } from '../../actions/orderActions'
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants'
import { peso } from '../../Utils/money'
import { askConfirm } from '../../Utils/confirm'

const ProcessOrder = () => {
    const dispatch = useDispatch()
    const { loading, order = {} } = useSelector(state => state.orderDetails)
    const { error, isUpdated, emailSent, emailError } = useSelector(state => state.order)
    const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus } = order
    const [status, setStatus] = useState('Processing')
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()
    const { id: orderId } = useParams()

    useEffect(() => {
        dispatch(getOrderDetails(orderId))
    }, [dispatch, orderId])

    useEffect(() => {
        if (order?.orderStatus) setStatus(order.orderStatus)
    }, [order?._id, order?.orderStatus])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    useEffect(() => {
        if (!isUpdated) return
        toast.success('Order Status Updated', { position: 'bottom-right' })
        if (emailSent) toast.success('Email Sent', { position: 'bottom-right' })
        else toast.error('Email Failed to Send', { position: 'bottom-right' })
        setSaving(false)
        dispatch({ type: UPDATE_ORDER_RESET })
        dispatch(getOrderDetails(orderId))
    }, [isUpdated, emailSent, emailError, dispatch, orderId])

    const updateOrderHandler = async (id) => {
        if (!status) {
            toast.error('Choose an order status', { position: 'bottom-right' })
            return
        }
        if (orderStatus === 'Delivered') {
            toast.error('This order is already delivered', { position: 'bottom-right' })
            return
        }
        if (status === orderStatus) {
            toast.error('Pick a different status first', { position: 'bottom-right' })
            return
        }
        const ok = await askConfirm('Update this order?', `Change status to ${status}?`)
        if (!ok) return
        setSaving(true)
        dispatch(updateOrder(id, { status }))
    }

    const shippingDetails = shippingInfo && `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`
    const isCash = Boolean(paymentInfo && (
        paymentInfo.id === 'cash'
        || paymentInfo.method === 'Cash on delivery'
        || String(paymentInfo.status || '').toLowerCase().includes('cash')
    ))
    const isPaid = Boolean(
        (paymentInfo && paymentInfo.status === 'succeeded')
        || (isCash && String(orderStatus || '').includes('Delivered'))
    )
    const paymentType = !paymentInfo
        ? 'Not set'
        : paymentInfo.method
            || (isCash ? 'Cash on delivery' : (paymentInfo.status === 'succeeded' ? 'Card' : 'Not set'))
    const alreadyDelivered = String(orderStatus || '') === 'Delivered'

    return (
        <>
            <MetaData title={`Process ${order?.code || (order?._id ? `JO${order._id}` : 'Order')}`} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <button type="button" className="back-btn" onClick={() => navigate(-1)}>
                        <span className="back-btn-icon" aria-hidden="true"><i className="fa fa-angle-left"></i></span>
                        Back
                    </button>
                    {loading ? <Loader /> : (
                        <div className="row d-flex justify-content-around">
                            <div className="col-12 col-lg-7 order-details">
                                <h2 className="my-5">{order.code || (order._id ? `JO${order._id}` : 'Order')}</h2>
                                <h4 className="mb-4">Shipping Info</h4>
                                <p><b>Name:</b> {user && user.name}</p>
                                <p><b>Phone:</b> {shippingInfo && shippingInfo.phoneNo}</p>
                                <p className="mb-4"><b>Address:</b>{shippingDetails}</p>
                                <p><b>Amount:</b> {peso(totalPrice)}</p>
                                <hr />
                                <h4 className="my-4">Payment</h4>
                                <p><b>Type:</b> {paymentType}</p>
                                <p className={isPaid ? 'greenColor' : 'redColor'}><b>{isPaid ? 'PAID' : 'NOT PAID'}</b></p>
                                <h4 className="my-4">Order Status:</h4>
                                <p className={alreadyDelivered ? 'greenColor' : 'redColor'}><b>{orderStatus}</b></p>
                                <h4 className="my-4">Order Items:</h4>
                                <hr />
                                <div className="cart-item my-1">
                                    {orderItems && orderItems.map(item => (
                                        <div key={`${item.product}-${item.size || ''}`} className="row my-5">
                                            <div className="col-4 col-lg-2">
                                                <img src={item.image} alt={item.name} height="45" width="65" />
                                            </div>
                                            <div className="col-5 col-lg-5">
                                                <Link to={`/product/${item.product}`}>{item.name}</Link>
                                            </div>
                                            <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                                <p>{peso(item.price)}</p>
                                            </div>
                                            <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                                <p>{item.quantity} Piece(s)</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <hr />
                            </div>
                            <div className="col-12 col-lg-3 mt-5">
                                <h4 className="my-4">Status</h4>
                                {alreadyDelivered ? (
                                    <p className="greenColor"><b>Already delivered. Status cannot change.</b></p>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <select
                                                className="form-control"
                                                name="status"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </div>
                                        <button
                                            className="btn btn-primary btn-block"
                                            disabled={saving}
                                            onClick={() => updateOrderHandler(order._id)}
                                        >
                                            {saving ? 'Updating...' : 'Update Status'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProcessOrder
