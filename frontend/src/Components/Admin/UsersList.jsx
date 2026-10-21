import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import axios from 'axios';
import { errMsg, successMsg } from '../../Utils/helpers';
import { DataGrid } from '@mui/x-data-grid'
import TableFace from './TableFace'

const UsersList = () => {
    const [loading, setLoading] = useState(true)
    const [allUsers, setAllUsers] = useState([])
    const [isDeleted, setIsDeleted] = useState(false)
    const listUsers = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, {
                withCredentials: true
            })
            setAllUsers(data.users)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not load users')
        } finally {
            setLoading(false)
        }
    }
    const deleteUser = async (id) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, {
                withCredentials: true
            })
            setIsDeleted(data.success)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not delete that user')
        }
    }

    useEffect(() => {
        listUsers()
    }, [])

    useEffect(() => {
        if (isDeleted) {
            successMsg('User deleted successfully')
            setIsDeleted(false)
            listUsers()
        }
    }, [isDeleted])


    const deleteUserHandler = (id) => {
        deleteUser(id)
    }

    const columns = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            minWidth: 220,
            renderCell: (params) => <TableFace image={params.row.avatar} title={params.row.name} />
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (

                <>
                    <Link to={`/admin/user/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteUserHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];
    const rows = allUsers.map(user => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar?.url || '',
        email: user.email,
        role: user.role,
    }));

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <>
                        <h1 className="page-title">All Users</h1>
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}

                                    rowHeight={72}
                                    pageSize={10}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    disableSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default UsersList

