import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    NEW_PRODUCT_REQUEST,
    NEW_PRODUCT_SUCCESS,
    NEW_PRODUCT_RESET,
    NEW_PRODUCT_FAIL,

    ADMIN_PRODUCTS_REQUEST,
    ADMIN_PRODUCTS_SUCCESS,
    ADMIN_PRODUCTS_FAIL,

    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_RESET,
    UPDATE_PRODUCT_FAIL,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_FAIL,
    DELETE_PRODUCT_RESET,
    NEW_REVIEW_REQUEST,
    NEW_REVIEW_SUCCESS,
    NEW_REVIEW_FAIL,
    NEW_REVIEW_RESET,
    NEW_OFFER_REQUEST,
    NEW_OFFER_SUCCESS,
    NEW_OFFER_RESET,
    NEW_OFFER_FAIL,
    MY_OFFERS_REQUEST,
    MY_OFFERS_SUCCESS,
    MY_OFFERS_FAIL,
    ADMIN_OFFERS_REQUEST,
    ADMIN_OFFERS_SUCCESS,
    ADMIN_OFFERS_FAIL,
    REVIEW_OFFER_REQUEST,
    REVIEW_OFFER_SUCCESS,
    REVIEW_OFFER_RESET,
    REVIEW_OFFER_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants'

export const productsReducer = (state = { products: [] }, action) => {
    switch (action.type) {
        case ADMIN_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true,
                products: []
            }
        case ALL_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true,
                products: action.append ? state.products : []
            }
        case ALL_PRODUCTS_SUCCESS: {
            const incoming = action.payload.products || []
            const products = action.append
                ? [...state.products, ...incoming].filter((item, index, list) => list.findIndex(other => other._id === item._id) === index)
                : incoming
            return {
                ...state,
                loading: false,
                products,
                productsCount: action.payload.productsCount,
                resPerPage: action.payload.resPerPage,
                filteredProductsCount: action.payload.filteredProductsCount
            }
        }
        case ADMIN_PRODUCTS_SUCCESS:
            return {
                ...state,
                loading: false,
                products: action.payload

            }
        case ALL_PRODUCTS_FAIL:
        case ADMIN_PRODUCTS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }


        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state;
    }
}

export const productDetailsReducer = (state = { product: {} }, action) => {
    switch (action.type) {

        case PRODUCT_DETAILS_REQUEST:
            return {
                ...state,
                loading: true
            }

        case PRODUCT_DETAILS_SUCCESS:
            return {
                ...state,
                loading: false,
                product: action.payload,
                canReview: Boolean(action.canReview),
                myReview: action.myReview || null
            }

        case PRODUCT_DETAILS_FAIL:
            return {
                ...state,
                error: action.payload
            }

        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }

        default:
            return state
    }
}

export const newProductReducer = (state = { product: {} }, action) => {
    switch (action.type) {
        case NEW_PRODUCT_REQUEST:

            return {
                ...state,
                loading: true
            }
        case NEW_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                success: action.payload.success,
                product: action.payload.product
            }
        case NEW_PRODUCT_FAIL:

            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case NEW_PRODUCT_RESET:

            return {
                ...state,
                success: false
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}

export const productReducer = (state = {}, action) => {
    switch (action.type) {

        case DELETE_PRODUCT_REQUEST:
        case UPDATE_PRODUCT_REQUEST:
            return {
                ...state,
                loading: true
            }

        case DELETE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: action.payload
            }

        case UPDATE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isUpdated: action.payload
            }


        case DELETE_PRODUCT_FAIL:
        case UPDATE_PRODUCT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }

        case DELETE_PRODUCT_RESET:
            return {
                ...state,
                isDeleted: false
            }
        case UPDATE_PRODUCT_RESET:
            return {
                ...state,
                isUpdated: false
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}

export const newOfferReducer = (state = {}, action) => {
    switch (action.type) {
        case NEW_OFFER_REQUEST:
            return { ...state, loading: true }
        case NEW_OFFER_SUCCESS:
            return {
                loading: false,
                success: action.payload.success,
                offer: action.payload.product
            }
        case NEW_OFFER_FAIL:
            return { ...state, loading: false, error: action.payload }
        case NEW_OFFER_RESET:
            return { ...state, success: false }
        case CLEAR_ERRORS:
            return { ...state, error: null }
        default:
            return state
    }
}

export const myOffersReducer = (state = { offers: [] }, action) => {
    switch (action.type) {
        case MY_OFFERS_REQUEST:
            return { ...state, loading: true }
        case MY_OFFERS_SUCCESS:
            return { loading: false, offers: action.payload }
        case MY_OFFERS_FAIL:
            return { ...state, loading: false, error: action.payload }
        case CLEAR_ERRORS:
            return { ...state, error: null }
        default:
            return state
    }
}

export const adminOffersReducer = (state = { offers: [] }, action) => {
    switch (action.type) {
        case ADMIN_OFFERS_REQUEST:
            return { ...state, loading: true }
        case ADMIN_OFFERS_SUCCESS:
            return { loading: false, offers: action.payload }
        case ADMIN_OFFERS_FAIL:
            return { ...state, loading: false, error: action.payload }
        case CLEAR_ERRORS:
            return { ...state, error: null }
        default:
            return state
    }
}

export const offerReviewReducer = (state = {}, action) => {
    switch (action.type) {
        case REVIEW_OFFER_REQUEST:
            return { ...state, loading: true }
        case REVIEW_OFFER_SUCCESS:
            return { loading: false, success: action.payload.success }
        case REVIEW_OFFER_FAIL:
            return { ...state, loading: false, error: action.payload }
        case REVIEW_OFFER_RESET:
            return { ...state, success: false }
        case CLEAR_ERRORS:
            return { ...state, error: null }
        default:
            return state
    }
}

export const newReviewReducer = (state = {}, action) => {
    switch (action.type) {
        case NEW_REVIEW_REQUEST:
            return { ...state, loading: true }
        case NEW_REVIEW_SUCCESS:
            return { loading: false, success: action.payload }
        case NEW_REVIEW_FAIL:
            return { ...state, loading: false, error: action.payload }
        case NEW_REVIEW_RESET:
            return { ...state, success: false }
        case CLEAR_ERRORS:
            return { ...state, error: null }
        default:
            return state
    }
}
