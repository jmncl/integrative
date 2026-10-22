import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'

import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { getToken } from '../../Utils/helpers';
import { useSelector } from 'react-redux'
const Profile = () => {
    const { user, loading } = useSelector(state => state.auth)
    // const [loading, setLoading] = useState(true)
    // const [user, setUser] = useState({})


    // const getProfile = async () => {
    //     const config = {
    //         headers: {
    //             'Authorization': `Bearer ${getToken()}`
    //         }
    //     }
    //     try {
    //         const { data } = await axios.get(`http://localhost:4001/api/v1/me`, config)
    //         console.log(data.user)
    //         setUser(data.user)
    //         setLoading(false)
    //     } catch (error) {
    //         console.log(error)
    //         toast.error("invalid user or password", {
    //             position: 'bottom-center'
    //         })
    //     }

    // }

    // useEffect(() => {

    //     getProfile()

    // }, [])
    if (loading || !user?.name) {
        if (loading === false) return <Navigate to="/login" />
        return <Loader />
    }

    return (
        <>
                    <MetaData title={'Your Profile'} />

                    <section className="profile-page">
                        <h1 className="page-title">My Profile</h1>
                        <div className="profile-card">
                            <figure className="profile-photo">
                                <img src={user.avatar ? user.avatar.url : ''} alt={user.name} referrerPolicy="no-referrer" />
                            </figure>
                            <div>
                                <p className="profile-label">Full name</p>
                                <p className="profile-value">{user.name}</p>
                                <p className="profile-label">Email address</p>
                                <p className="profile-value">{user.email}</p>
                                <p className="profile-label">Joined on</p>
                                <p className="profile-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                                <div className="profile-actions">
                                    <Link to="/me/update" className="btn">Edit Profile</Link>
                                    {user.role !== 'admin' && (
                                        <Link to="/orders/me" className="btn">My Orders</Link>
                                    )}
                                    <Link to="/password/update" className="btn ghost">Change Password</Link>
                                </div>
                            </div>
                        </div>
                    </section>
        </>
    )
}

export default Profile