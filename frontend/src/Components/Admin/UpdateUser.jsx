import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { errMsg, successMsg } from '../../Utils/helpers';
import { askConfirm } from '../../Utils/confirm';

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
    const submitHandler = async (e) => {
        e.preventDefault();
        if (!user) return
        const ok = await askConfirm('Save this user?', 'This updates the name and role.')
        if (!ok) return
        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', user.email);
        formData.set('role', role);
        updateUser(user._id, formData)
    }

    const deactivate = async () => {
        const ok = await askConfirm('Deactivate this user?', 'They will not be able to log in. Older orders stay as they are.')
        if (!ok) return
        try {
            await axios.delete(`${import.meta.env.VITE_API}/admin/user/${user._id}`, { withCredentials: true })
            successMsg('User deactivated')
            getUserDetails(id)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not deactivate that user')
        }
    }

    const reactivate = async () => {
        const ok = await askConfirm('Reactivate this user?', 'They will be able to log in again.')
        if (!ok) return
        try {
            await axios.put(`${import.meta.env.VITE_API}/admin/users/restore`, { ids: [user._id] }, { withCredentials: true })
            successMsg('User reactivated')
            getUserDetails(id)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not reactivate that user')
        }
    }

    return (
        <>
            <MetaData title={`Update User`} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <button type="button" className="back-btn" onClick={() => navigate(-1)}>
                        <span className="back-btn-icon" aria-hidden="true"><i className="fa fa-angle-left"></i></span>
                        Back
                    </button>
                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg" onSubmit={submitHandler}>
                                <h1 className="mt-2 mb-4">User</h1>
                                {user?.avatar?.url && <img className="user-view-photo" src={user.avatar.url} alt="" referrerPolicy="no-referrer" />}
                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input
                                        type="text"
                                        id="name_field"
                                        className="form-control"
                                        name='name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <p className="photo-note">{email}</p>
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <div className="role-picks">
                                        <button type="button" className={role === 'user' ? 'on' : ''} onClick={() => setRole('user')}>User</button>
                                        <button type="button" className={role === 'admin' ? 'on' : ''} onClick={() => setRole('admin')}>Admin</button>
                                    </div>
                                </div>
                                <button type="submit" className="btn update-btn btn-block mt-4 mb-3">Update</button>
                                {user?.deletedAt && <p className="photo-note">This account is deactivated.</p>}
                                {user && (user.deletedAt ? (
                                    <button type="button" className="account-toggle on" onClick={reactivate}><i className="fa fa-undo"></i> Reactivate</button>
                                ) : (
                                    <button type="button" className="account-toggle" onClick={deactivate}><i className="fa fa-ban"></i> Deactivate</button>
                                ))}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateUser