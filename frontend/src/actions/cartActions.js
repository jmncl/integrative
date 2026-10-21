import axios from 'axios'
import { ADD_TO_CART, REMOVE_ITEM_CART, SAVE_SHIPPING_INFO, LOAD_CART, CLEAR_CART } from '../constants/cartConstants'

const readJson = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : fallback
    } catch (error) {
        return fallback
    }
}

let loadedForUserId = null

export const resetCartOwner = () => {
    loadedForUserId = null
}

const readShipping = (userId) => {
    const saved = readJson(`shippingInfo:${userId}`, null)
    if (!saved || String(saved.ownerId) !== String(userId)) return {}
    const { ownerId, ...info } = saved
    return info
}

const saveCart = (getState) => {
    const userId = getState().auth.user?._id
    if (!userId || String(loadedForUserId) !== String(userId)) return
    localStorage.setItem(`cartItems:${userId}`, JSON.stringify(getState().cart.cartItems))
    localStorage.setItem(`shippingInfo:${userId}`, JSON.stringify({
        ...(getState().cart.shippingInfo || {}),
        ownerId: userId
    }))
}

export const loadUserCart = (userId) => (dispatch) => {
    localStorage.removeItem('cartItems')
    localStorage.removeItem('shippingInfo')
    loadedForUserId = userId
    dispatch({
        type: LOAD_CART,
        payload: {
            userId,
            cartItems: readJson(`cartItems:${userId}`, []),
            shippingInfo: readShipping(userId)
        }
    })
}

export const addItemToCart = (id, quantity, size = '') => async (dispatch, getState) => {
    const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
    const listingType = data.product.listingType || 'shop'
    const status = data.product.status || 'approved'
    if (status !== 'approved' || listingType === 'trade') {
        throw new Error('This listing is not for sale')
    }
    const sizeRow = (data.product.sizes || []).find(item => item.label === size)
    dispatch({
        type: ADD_TO_CART,
        payload: {
            product: data.product._id,
            name: data.product.name,
            price: data.product.price,
            image: data.product.images[0].url,
            stock: sizeRow ? sizeRow.stock : data.product.stock,
            size: size || '',
            quantity
        }
    })
    saveCart(getState)
}

export const removeItemFromCart = (id, size = '') => async (dispatch, getState) => {
    dispatch({
        type: REMOVE_ITEM_CART,
        payload: { product: id, size }
    })
    saveCart(getState)
}

export const saveShippingInfo = (data) => async (dispatch, getState) => {
    dispatch({
        type: SAVE_SHIPPING_INFO,
        payload: data
    })
    saveCart(getState)
}

export const clearCart = () => async (dispatch, getState) => {
    const userId = getState().auth.user?._id
    if (userId) {
        localStorage.removeItem(`cartItems:${userId}`)
        localStorage.removeItem(`shippingInfo:${userId}`)
    }
    localStorage.removeItem('cartItems')
    localStorage.removeItem('shippingInfo')
    dispatch({
        type: CLEAR_CART,
    })
}
