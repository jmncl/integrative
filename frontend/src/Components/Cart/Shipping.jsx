import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { countries } from 'countries-list'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import CheckoutSteps from './CheckoutSteps'
import { useDispatch, useSelector } from 'react-redux'
import { saveShippingInfo, loadUserCart } from '../../actions/cartActions'

const Shipping = () => {
    const dispatch = useDispatch()
    const { shippingInfo, cartOwnerId } = useSelector(state => state.cart)
    const { user, loading } = useSelector(state => state.auth)
    const ready = user?._id && String(cartOwnerId) === String(user._id)

    useEffect(() => {
        if (!user?._id) return
        if (String(cartOwnerId) === String(user._id)) return
        dispatch(loadUserCart(user._id))
    }, [dispatch, user?._id, cartOwnerId])

    if (loading || !user?._id || !ready) {
        return <Loader />
    }

    return <ShippingForm key={user._id} shippingInfo={shippingInfo} />
}

const ShippingForm = ({ shippingInfo }) => {
    const dispatch = useDispatch();
    const countriesList = Object.values(countries)
    const [address, setAddress] = useState(shippingInfo.address || '')
    const [city, setCity] = useState(shippingInfo.city || '')
    const [postalCode, setPostalCode] = useState(shippingInfo.postalCode || '')
    const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || '')
    const [country, setCountry] = useState(shippingInfo.country || 'Philippines')
    let navigate = useNavigate();
    const submitHandler = (e) => {
        e.preventDefault()

        dispatch(saveShippingInfo({ address, city, phoneNo, postalCode, country }))
        navigate('/confirm')
    }

    return (
        <>
            <MetaData title={'Shipping Info'} />
            <CheckoutSteps />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form
                        className="shadow-lg"
                        onSubmit={submitHandler}
                        autoComplete="off"
                    >
                        <h1 className="mb-4">Shipping Info</h1>
                        <div className="form-group">
                            <label htmlFor="address_field">Address</label>
                            <input
                                type="text"
                                id="address_field"
                                className="form-control"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="city_field">City</label>
                            <input
                                type="text"
                                id="city_field"
                                className="form-control"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone_field">Phone No</label>
                            <input
                                type="phone"
                                id="phone_field"
                                className="form-control"
                                value={phoneNo}
                                onChange={(e) => setPhoneNo(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="postal_code_field">Postal Code</label>
                            <input
                                type="number"
                                id="postal_code_field"
                                className="form-control"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="country_field">Country</label>
                            <select
                                id="country_field"
                                className="form-control"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                autoComplete="off"
                                required
                            >

                                {countriesList.map(country => (
                                    <option key={country.name} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}

                            </select>
                        </div>

                        <button
                            id="shipping_btn"
                            type="submit"
                            className="btn btn-block py-3"
                        >
                            CONTINUE
                        </button>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Shipping
