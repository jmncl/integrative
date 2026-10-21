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
import Blank from './Components/Layout/Blank'
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

  // const [state, setState] = useState({
  //   cartItems: localStorage.getItem('cartItems')
  //     ? JSON.parse(localStorage.getItem('cartItems'))
  //     : [],

  //   shippingInfo: localStorage.getItem('shippingInfo')
  //     ? JSON.parse(localStorage.getItem('shippingInfo'))
  //     : {},
  // })

  // const addItemToCart = async (id, quantity) => {
  //   // console.log(id, quantity)
  //   try {
  //     const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
  //     const item = {
  //       product: data.product._id,
  //       name: data.product.name,
  //       price: data.product.price,
  //       image: data.product.images[0].url,
  //       stock: data.product.stock,
  //       quantity: quantity
  //     }

  //     const isItemExist = state.cartItems.find(i => i.product === item.product)

  //     // setState({
  //     //   ...state,
  //     //   cartItems: [...state.cartItems, item]
  //     // })
  //     if (isItemExist) {
  //       setState({
  //         ...state,
  //         cartItems: state.cartItems.map(i => i.product === isItemExist.product ? item : i)
  //       })
  //     }
  //     else {
  //       setState({
  //         ...state,
  //         cartItems: [...state.cartItems, item]
  //       })
  //     }

  //     toast.success('Item Added to Cart', {
  //       position: 'bottom-right'
  //     })


  //   } catch (error) {
  //     toast.error(error, {
  //       position: 'top-left'
  //     });

  //   }

  // }
  // localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
  // const removeItemFromCart = async (id) => {
  //   setState({
  //     ...state,
  //     cartItems: state.cartItems.filter(i => i.product !== id)
  //   })
  //   localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
  // }

  // const saveShippingInfo = async (data) => {
  //   setState({
  //     ...state,
  //     shippingInfo: data
  //   })
  //   localStorage.setItem('shippingInfo', JSON.stringify(data))
  // }
  return (
    <div className="site">
      <Router>
        <Header />
        <main className="site-main">
        <Routes>
          <Route path="/" element={<CustomerRoute><Home /></CustomerRoute>} exact="true" />
          {/* <Route path="/product/:id" element={<ProductDetails cartItems={state.cartItems} addItemToCart={addItemToCart} />} exact="true" /> */}
          <Route path="/product/:id" element={<CustomerRoute><ProductDetails /></CustomerRoute>} exact="true" />
          <Route path="/search/:keyword" element={<CustomerRoute><Home /></CustomerRoute>} exact="true" />
          <Route path="/login" element={<Login />} exact="true" />
          <Route path="/register" element={<CustomerRoute><Register /></CustomerRoute>} />
          <Route path="/password/forgot" element={<Blank />} exact="true" />
          <Route path="/password/reset/:token" element={<Blank />} exact="true" />
          <Route path="/blank" element={<Blank />} />
          <Route path="/me" element={<CustomerRoute><Profile /></CustomerRoute>} exact="true" />
          <Route path="/me/update" element={<CustomerRoute><UpdateProfile /></CustomerRoute>} exact="true" />
          <Route path="/password/update" element={<CustomerRoute><UpdatePassword /></CustomerRoute>} />
          {/* <Route path="/cart" element={<Cart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} />} exact="true" /> */}
          <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} exact="true" />
          {/* <Route path="/shipping" element={<Shipping shipping={state.shippingInfo} saveShippingInfo={saveShippingInfo} />} />
          <Route path="/confirm" element={<ConfirmOrder cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} />
          <Route path="/payment" element={<Payment cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} /> */}


          <Route path="/shipping" element={<CustomerRoute><Shipping /></CustomerRoute>} />
          <Route path="/confirm" element={<CustomerRoute><ConfirmOrder /></CustomerRoute>} />
          <Route path="/payment" element={<CustomerRoute><Payment /></CustomerRoute>} />
          <Route path="/success" element={<CustomerRoute><OrderSuccess /></CustomerRoute>} />
          <Route path="/orders/me" element={<CustomerRoute><ListOrders /></CustomerRoute>} />
          <Route path="/offer" element={<ProtectedRoute><CustomerRoute><NewOffer /></CustomerRoute></ProtectedRoute>} />
          <Route path="/offers/me" element={<ProtectedRoute><CustomerRoute><MyOffers /></CustomerRoute></ProtectedRoute>} />
          <Route path="/order/:id" element={<CustomerRoute><OrderDetails /></CustomerRoute>} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}

          {/* <Route path="/admin/products" element={<ProductsList />} /> */}
          {/* <Route path="/admin/product" element={<NewProduct />} /> */}
          {/* <Route
            path="/admin/orders"
            element={<OrdersList />}

          /> */}
          <Route
            path="/admin/order/:id"
            element={<ProcessOrder />} />
          <Route
            path="/admin/users"
            element={<UsersList />} />
          <Route path="/admin/user/:id" element={<UpdateUser />} />

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
