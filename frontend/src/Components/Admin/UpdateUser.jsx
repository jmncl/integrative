import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { errMsg, successMsg } from '../../Utils/helpers';

import axios from 'axios';

const UpdateUser = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [isUpdated, setIsUpdated] = useState(false)
    let navigate = useNavigate();

    const { id } = useParams();
    const getUserDetails = async (id) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/user/${id}`, {
                withCredentials: true
            })
            setUser(data.user)
            setName(data.user.name)
            setEmail(data.user.email)
            setRole(data.user.role)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not load that user')
        } finally {
            setLoading(false)
        }
    }

    const updateUser = async (id, userData) => {
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/user/${id}`, userData, {
                withCredentials: true
            })
            setIsUpdated(data.success)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not update that user')
        }
    }

    useEffect(() => {
        getUserDetails(id)
    }, [id])

    useEffect(() => {
        if (isUpdated) {
            successMsg('User updated successfully')
            navigate('/admin/users')
        }
    }, [isUpdated])
    const submitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('role', role);
        updateUser(user._id, formData)
    }

    return (
        <>
            <MetaData title={`Update User`} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg" onSubmit={submitHandler}>
                                <h1 className="mt-2 mb-5">Update User</h1>
                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input
                                        type="name"
                                        id="name_field"
                                        className="form-control"
                                        name='name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control"
                                        name='email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role_field">Role</label>
                                    <select
                                        id="role_field"
                                        className="form-control"
                                        name='role'
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn update-btn btn-block mt-4 mb-3" >Update</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateUser