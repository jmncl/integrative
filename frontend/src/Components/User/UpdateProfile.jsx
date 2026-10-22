import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import MetaData from '../Layout/MetaData'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import { getToken } from '../../Utils/helpers';
import { updateProfile, loadUser, clearErrors } from '../../actions/userActions'

import { UPDATE_PROFILE_RESET } from '../../constants/userConstants'
import { useDispatch, useSelector } from 'react-redux'


const profileSchema = yup.object({
    name: yup.string().trim().required('Name is required').max(30, 'Name cannot exceed 30 characters'),
    email: yup.string().email('Enter a valid email').required('Email is required')
})

const UpdateProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { error, isUpdated, loading } = useSelector(state => state.user)
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(profileSchema)
    })
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('')
    // const [error, setError] = useState('')
    // const [user, setUser] = useState({})
    // const [loading, setLoading] = useState(false)
    // const [isUpdated, setIsUpdated] = useState(false)
    let navigate = useNavigate();

    // const getProfile = async () => {
    //     const config = {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${getToken()}`
    //         }
    //     }
    //     try {
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config)
    //         console.log(data)
    //         setUser(data.user)
    //         setName(data.user.name);
    //         setEmail(data.user.email);
    //         setAvatarPreview(data.user.avatar.url)
    //         setLoading(false)
    //     } catch (error) {
    //         console.log(error)
    //         toast.error('user not found', {
    //             position: 'bottom-right'
    //         });
    //     }
    // }

    // const updateProfile = async (userData) => {
    //     const config = {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //             'Authorization': `Bearer ${getToken()}`
    //         }
    //     }
    //     try {
    //         const { data } = await axios.put(`${import.meta.env.VITE_API}/me/update`, userData, config)
    //         setIsUpdated(data.success)
    //         setLoading(false)
    //         toast.success('user updated', {
    //             position: 'bottom-right'
    //         });
    //         getProfile();
    //         navigate('/me', { replace: true })


    //     } catch (error) {
    //         console.log(error)
    //         toast.error('user not found', {
    //             position: 'bottom-right'
    //         });
    //     }
    // }

    // console.log(error)
    // useEffect(() => {
    //     getProfile()

    // }, [])

    useEffect(() => {
        console.log(user)
        if (user) {
            reset({ name: user.name, email: user.email })
            setAvatarPreview(user.avatar && user.avatar.url)
        }
        if (error) {
            // alert.error(error);
            console.log(error)
            dispatch(clearErrors());
        }
        if (isUpdated) {
            // alert.success('User updated successfully')
            dispatch(loadUser());
            navigate('/me', { replace: true })
            dispatch({
                type: UPDATE_PROFILE_RESET
            })
        }
    }, [error, isUpdated, user])

    const submitHandler = (values) => {
        const formData = new FormData();
        formData.set('name', values.name);
        formData.set('email', values.email);
        formData.set('avatar', avatar);
        dispatch(updateProfile(formData))
    }

    const onChange = e => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
        }
        reader.readAsDataURL(e.target.files[0])
    }
    // console.log(user)


    return (
        <>
            <MetaData title={'Update Profile'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={handleSubmit(submitHandler)} encType='multipart/form-data'>
                        <h1 className="mt-2 mb-5">Update Profile</h1>

                        <div className="form-group">
                            <label htmlFor="email_field">Name</label>
                            <input type="text" id="name_field" className="form-control" {...register('name')} />
                            {errors.name && <p className="text-danger mt-2 mb-0">{errors.name.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input type="email" id="email_field" className="form-control" {...register('email')} />
                            {errors.email && <p className="text-danger mt-2 mb-0">{errors.email.message}</p>}
                        </div>

                        <div className='form-group'>
                            <label htmlFor='avatar_upload'>Profile photo</label>
                            <div className='d-flex align-items-center'>
                                <figure className='avatar mr-3'>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} className='rounded-circle' alt='Avatar Preview' referrerPolicy="no-referrer" />
                                    ) : (
                                        <span className="avatar-fallback">J</span>
                                    )}
                                </figure>
                                <input type='file' name='avatar' accept='image/*' onChange={onChange} />
                            </div>
                        </div>

                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false} >Update</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UpdateProfile