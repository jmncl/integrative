import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

import {
    productsReducer,
    productDetailsReducer,
    newProductReducer,
    productReducer,
    newOfferReducer,
    myOffersReducer,
    adminOffersReducer,
    offerReviewReducer,
    newReviewReducer,



} from './reducers/productReducers'
import {
    authReducer,
    userReducer,
    forgotPasswordReducer,
    // allUsersReducer,
    // userDetailsReducer, 
} from './reducers/userReducers'

import { cartReducer } from './reducers/cartReducers';

import {
    newOrderReducer,
    myOrdersReducer,
    orderDetailsReducer,
    allOrdersReducer,
    orderReducer,
} from './reducers/orderReducers';

let initialState = {
    cart: {
        cartItems: [],
        shippingInfo: {}
    },
    user: {},
    auth: {},

}



const reducer = combineReducers({
    products: productsReducer,
    productDetails: productDetailsReducer,
    auth: authReducer,
    user: userReducer,
    forgotPassword: forgotPasswordReducer,
    newProduct: newProductReducer,
    newOffer: newOfferReducer,
    myOffers: myOffersReducer,
    adminOffers: adminOffersReducer,
    offerReview: offerReviewReducer,
    newReview: newReviewReducer,
    cart: cartReducer,
    newOrder: newOrderReducer,
    myOrders: myOrdersReducer,
    orderDetails: orderDetailsReducer,
    product: productReducer,
    // newReview: newReviewReducer,
    allOrders: allOrdersReducer,
    order: orderReducer,
    // allUsers: allUsersReducer,
    // userDetails: userDetailsReducer,


})

const middlware = [thunk]
const store = createStore(reducer, initialState, applyMiddleware(...middlware))
export default store;