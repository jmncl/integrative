import { useEffect } from 'react'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { loadUser } from './actions/userActions'
import { loadUserCart } from './actions/cartActions'

import Header from './Components/Layout/Header'
import Footer from './Components/Layout/Footer'
import Home from './Components/Home'
import ProductDetails from './Components/Product/ProductDetails'
import Register from './Components/User/Register'
import Login from './Components/User/Login'
import Profile from './Components/User/Profile';
import UpdateProfile from './Components/User/UpdateProfile';
import UpdatePassword from './Components/User/UpdatePassword';
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import ConfirmOrder from './Components/Cart/ConfirmOrder';
import Payment from './Components/Cart/Payment';
import OrderSuccess from './Components/Cart/OrderSuccess';
import ListOrders from './Components/Order/ListOrders';
import OrderDetails from './Components/Order/OrderDetails';
import Dashboard from './Components/Admin/Dashboard';
import ProductsList from './Components/Admin/ProductsList';
import NewProduct from './Components/Admin/NewProduct';
import OrdersList from './Components/Admin/OrdersList';
import ProcessOrder from './Components/Admin/ProcessOrder';
import UsersList from './Components/Admin/UsersList';
import UpdateUser from './Components/Admin/UpdateUser';
import ProtectedRoute from './Components/Route/ProtectedRoute';
import CustomerRoute from './Components/Route/CustomerRoute';
import UpdateProduct from './Components/Admin/UpdateProduct';
import OfferQueue from './Components/Admin/OfferQueue';
import ProductReviews from './Components/Admin/ProductReviews';
import NewOffer from './Components/Offer/NewOffer';
import MyOffers from './Components/Offer/MyOffers';
function App() {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(loadUser())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(loadUserCart(user._id))
    }
  }, [dispatch, isAuthenticated, user?._id])

  return (
    <div className="site">
      <Router>
        <Header />
        <main className="site-main">
        <Routes>
          <Route path="/" element={<CustomerRoute><Home /></CustomerRoute>} />
          <Route path="/product/:id" element={<CustomerRoute><ProductDetails /></CustomerRoute>} />
          <Route path="/search/:keyword" element={<CustomerRoute><Home /></CustomerRoute>} exact="true" />
          <Route path="/login" element={<Login />} exact="true" />
          <Route path="/register" element={<CustomerRoute><Register /></CustomerRoute>} />
          <Route path="/me" element={<CustomerRoute><Profile /></CustomerRoute>} exact="true" />
          <Route path="/me/update" element={<CustomerRoute><UpdateProfile /></CustomerRoute>} exact="true" />
          <Route path="/password/update" element={<CustomerRoute><UpdatePassword /></CustomerRoute>} />
          <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
          <Route path="/shipping" element={<CustomerRoute><Shipping /></CustomerRoute>} />
          <Route path="/confirm" element={<CustomerRoute><ConfirmOrder /></CustomerRoute>} />
          <Route path="/payment" element={<CustomerRoute><Payment /></CustomerRoute>} />
          <Route path="/success" element={<CustomerRoute><OrderSuccess /></CustomerRoute>} />
          <Route path="/orders/me" element={<CustomerRoute><ListOrders /></CustomerRoute>} />
          <Route path="/offer" element={<ProtectedRoute><CustomerRoute><NewOffer /></CustomerRoute></ProtectedRoute>} />
          <Route path="/offers/me" element={<ProtectedRoute><CustomerRoute><MyOffers /></CustomerRoute></ProtectedRoute>} />
          <Route path="/order/:id" element={<CustomerRoute><OrderDetails /></CustomerRoute>} />
          <Route path="/admin/order/:id" element={<ProtectedRoute isAdmin={true}><ProcessOrder /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute isAdmin={true}><UsersList /></ProtectedRoute>} />
          <Route path="/admin/user/:id" element={<ProtectedRoute isAdmin={true}><UpdateUser /></ProtectedRoute>} />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProductsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/product"
            element={
              <ProtectedRoute isAdmin={true}>
                <NewProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/product/:id"

            element={<ProtectedRoute isAdmin={true}>
              <UpdateProduct />
            </ProtectedRoute>} />

          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProductReviews />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/offers"
            element={
              <ProtectedRoute isAdmin={true}>
                <OfferQueue />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute isAdmin={true}>
                <OrdersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        </main>
        <Footer />
      </Router>
      <ToastContainer position="bottom-right" autoClose={2500} />
    </div>
  )
}

export default App
