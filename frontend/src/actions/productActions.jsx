import axios from 'axios';

import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    NEW_PRODUCT_REQUEST,
    NEW_PRODUCT_SUCCESS,
    NEW_PRODUCT_FAIL,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_FAIL,
    ADMIN_PRODUCTS_REQUEST,
    ADMIN_PRODUCTS_SUCCESS,
    ADMIN_PRODUCTS_FAIL,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_FAIL,
    NEW_OFFER_REQUEST,
    NEW_OFFER_SUCCESS,
    NEW_OFFER_FAIL,
    MY_OFFERS_REQUEST,
    MY_OFFERS_SUCCESS,
    MY_OFFERS_FAIL,
    ADMIN_OFFERS_REQUEST,
    ADMIN_OFFERS_SUCCESS,
    ADMIN_OFFERS_FAIL,
    REVIEW_OFFER_REQUEST,
    REVIEW_OFFER_SUCCESS,
    REVIEW_OFFER_FAIL,
    NEW_REVIEW_REQUEST,
    NEW_REVIEW_SUCCESS,
    NEW_REVIEW_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants';

export const getProducts = (currentPage = 1, keyword = '', price, category = '', rating = 0, reviews = '', append = false) => async (dispatch) => {
    try {
        dispatch({
            type: ALL_PRODUCTS_REQUEST,
            append
        })

        const params = new URLSearchParams({
            page: currentPage,
            keyword: keyword || '',
            'price[lte]': price[1],
            'price[gte]': price[0]
        })
        if (category) params.set('category', category)
        if (rating) params.set('ratings[gte]', rating)
        if (reviews === 'yes') params.set('numOfReviews[gte]', 1)
        if (reviews === 'no') params.set('numOfReviews[lte]', 0)
        const link = `${import.meta.env.VITE_API}/products?${params.toString()}`
        const { data } = await axios.get(link)
        dispatch({
            type: ALL_PRODUCTS_SUCCESS,
            payload: data,
            append
        })

    } catch (error) {
        dispatch({
            type: ALL_PRODUCTS_FAIL,
            payload: error.response?.data?.message || 'Could not load products'
        })
    }
}

export const getProductDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_DETAILS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`, { withCredentials: true })
        dispatch({
            type: PRODUCT_DETAILS_SUCCESS,
            payload: data.product,
            canReview: data.canReview,
            myReview: data.myReview
        })
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL,
            payload: error.response?.data?.message || 'Could not load product'
        })
    }
}

export const newProduct = (productData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_PRODUCT_REQUEST })
        const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, productData, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        })
        dispatch({
            type: NEW_PRODUCT_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: NEW_PRODUCT_FAIL,
            payload: error.response?.data?.message || 'Could not create the product'
        })
    }
}

export const getAdminProducts = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PRODUCTS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, {
            //AxiosRequestConfig parameter
            withCredentials: true //correct
        })
        dispatch({
            type: ADMIN_PRODUCTS_SUCCESS,
            payload: data.products
        })
    } catch (error) {
        dispatch({
            type: ADMIN_PRODUCTS_FAIL,
            payload: error.response.data.message
        })
    }
}

export const updateProduct = (id, productData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_PRODUCT_REQUEST })
        const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/product/${id}`, productData, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        })
        dispatch({
            type: UPDATE_PRODUCT_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: UPDATE_PRODUCT_FAIL,
            payload: error.response?.data?.message || 'Could not update the product'
        })
    }
}

export const deleteProducts = (ids) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_PRODUCT_REQUEST })
        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/products`, {
            data: { ids },
            withCredentials: true
        })
        dispatch({
            type: DELETE_PRODUCT_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_PRODUCT_FAIL,
            payload: error.response?.data?.message || 'Could not delete the products'
        })
    }
}

export const deleteProduct = (id) => async (dispatch) => {
    try {

        dispatch({ type: DELETE_PRODUCT_REQUEST })

        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}`)

        dispatch({
            type: DELETE_PRODUCT_SUCCESS,
            payload: data.success
        })

    } catch (error) {
        dispatch({
            type: DELETE_PRODUCT_FAIL,
            payload: error.response.data.message
        })
    }
}

export const newReview = (reviewData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_REVIEW_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API}/review`, reviewData, config)
        dispatch({
            type: NEW_REVIEW_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: NEW_REVIEW_FAIL,
            payload: error.response.data.message
        })
    }
}

export const newOffer = (offerData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_OFFER_REQUEST })
        const { data } = await axios.post(`${import.meta.env.VITE_API}/offer`, offerData, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        })
        dispatch({
            type: NEW_OFFER_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: NEW_OFFER_FAIL,
            payload: error.response?.data?.message || 'Could not send the offer'
        })
    }
}

export const getMyOffers = () => async (dispatch) => {
    try {
        dispatch({ type: MY_OFFERS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/offers/me`, {
            withCredentials: true
        })
        dispatch({
            type: MY_OFFERS_SUCCESS,
            payload: data.offers
        })
    } catch (error) {
        dispatch({
            type: MY_OFFERS_FAIL,
            payload: error.response?.data?.message || 'Could not load your offers'
        })
    }
}

export const getAdminOffers = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_OFFERS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/offers`, {
            withCredentials: true
        })
        dispatch({
            type: ADMIN_OFFERS_SUCCESS,
            payload: data.offers
        })
    } catch (error) {
        dispatch({
            type: ADMIN_OFFERS_FAIL,
            payload: error.response?.data?.message || 'Could not load offers'
        })
    }
}

export const reviewOffer = (id, status) => async (dispatch) => {
    try {
        dispatch({ type: REVIEW_OFFER_REQUEST })
        const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/offer/${id}`, { status }, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        })
        dispatch({
            type: REVIEW_OFFER_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: REVIEW_OFFER_FAIL,
            payload: error.response?.data?.message || 'Could not update the offer'
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS

    })
}
