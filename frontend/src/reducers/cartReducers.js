/* eslint-disable no-case-declarations */
import { ADD_TO_CART, REMOVE_ITEM_CART, SAVE_SHIPPING_INFO, LOAD_CART, CLEAR_CART } from '../constants/cartConstants'
export const cartReducer = (state = { cartItems: [], shippingInfo: {} }, action) => {
    switch (action.type) {
        case ADD_TO_CART: {
            const item = action.payload

            const isItemExist = state.cartItems.find(i => i.product === item.product && (i.size || '') === (item.size || ''))
            if (isItemExist) {
                return {
                    ...state,
                    cartItems: state.cartItems.map(i => i.product === isItemExist.product ? item : i)
                }
            } else {
                return {
                    ...state,
                    cartItems: [...state.cartItems, item]
                }
            }
        }
        case LOAD_CART:
            return {
                cartItems: action.payload.cartItems || [],
                shippingInfo: action.payload.shippingInfo || {},
                cartOwnerId: action.payload.userId
            }
        case REMOVE_ITEM_CART:
            return {
                ...state,
                cartItems: state.cartItems.filter(i => {
                    if (action.payload && typeof action.payload === 'object') {
                        return !(i.product === action.payload.product && (i.size || '') === (action.payload.size || ''))
                    }
                    return i.product !== action.payload
                })
            }

        case SAVE_SHIPPING_INFO:
            return {
                ...state,
                shippingInfo: action.payload
            }
        case CLEAR_CART:
            return {
                cartItems: [],
                shippingInfo: {},
                cartOwnerId: null
            }
        default:
            return state
    }
}