import React, { useEffect, useState } from 'react'
import RowAction from './RowAction'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import axios from 'axios';
import { errMsg, successMsg } from '../../Utils/helpers';
import ScrollTable from './ScrollTable'
import TableFace from './TableFace'
import TableBar from './TableBar'
import { askConfirm } from '../../Utils/confirm'

const UsersList = () => {
    const [loading, setLoading] = useState(true)
    const [allUsers, setAllUsers] = useState([])
    const [isDeleted, setIsDeleted] = useState(false)
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })
    const [query, setQuery] = useState('')
    const [showDeleted, setShowDeleted] = useState(false)
    const listUsers = async (deleted = showDeleted) => {
        setLoading(true)
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users${deleted ? '?deleted=1' : ''}`, {
                withCredentials: true
            })
            setAllUsers(data.users)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not load users')
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        listUsers(showDeleted)
    }, [showDeleted])

    useEffect(() => {
        if (isDeleted) {
            successMsg('Users deactivated')
            setIsDeleted(false)
            listUsers()
        }
    }, [isDeleted])


    const selectedIds = selection?.type === 'exclude'
        ? allUsers.map(user => user._id).filter(id => !selection.ids.has(id))
        : [...(selection?.ids || [])]

    const deleteSelected = async () => {
        if (!selectedIds.length) return
        const ok = await askConfirm('Deactivate selected users?', 'They cannot log in after this. Older orders still show their name.')
        if (!ok) return
        try {
            await axios.delete(`${import.meta.env.VITE_API}/admin/users`, {
                data: { ids: selectedIds },
                withCredentials: true
            })
            setSelection({ type: 'include', ids: new Set() })
            setIsDeleted(true)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not deactivate those users')
        }
    }

    const restoreIds = async (ids) => {
        if (!ids.length) return
        const ok = await askConfirm(ids.length > 1 ? 'Reactivate selected users?' : 'Reactivate this user?', 'They will be able to log in again.')
        if (!ok) return
        try {
            await axios.put(`${import.meta.env.VITE_API}/admin/users/restore`, { ids }, { withCredentials: true })
            setSelection({ type: 'include', ids: new Set() })
            successMsg(ids.length > 1 ? 'Users reactivated' : 'User reactivated')
            listUsers(showDeleted)
        } catch (error) {
            errMsg(error.response?.data?.message || 'Could not reactivate those users')
        }
    }

    const columns = [
        {
            field: 'id',
            headerName: 'UID',
            width: 110,
            renderCell: (params) => `UID${params.value}`
        },
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
            field: 'view',
            headerName: '',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <RowAction
                    showDeleted={showDeleted}
                    to={`/admin/user/${params.id}`}
                    restoreLabel="Reactivate"
                    onRestore={() => restoreIds([params.id])}
                />
            )
        }
    ];
    const needle = query.trim().toLowerCase()
    const rows = allUsers.map(user => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar?.url || '',
        email: user.email,
        role: user.role,
    })).sort((a, b) => Number(a.id) - Number(b.id))
        .filter(row => !needle || [`UID${row.id}`, row.name, row.email, row.role].join(' ').toLowerCase().includes(needle))

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <>
                        <div className="page-head">
                            <h1 className="page-title">All Users</h1>
                            <TableBar
                                query={query}
                                onQuery={setQuery}
                                placeholder="Search users"
                                showDeleted={showDeleted}
                                toggleLabel="Deactivated"
                                onToggleDeleted={() => { setSelection({ type: 'include', ids: new Set() }); setShowDeleted(value => !value) }}
                            />
                        </div>
                        {selectedIds.length > 0 && (
                            <div className="delete-row">
                                {showDeleted
                                    ? <button type="button" className="catalog-edit" onClick={() => restoreIds(selectedIds)}>Reactivate selected</button>
                                    : <button type="button" className="bulk-delete" onClick={deleteSelected}>Deactivate selected</button>}
                            </div>
                        )}
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <ScrollTable
                                    rows={rows}
                                    columns={columns}
                                    resetKey={`${query}-${showDeleted}`}
                                    rowHeight={72}
                                    sortingOrder={['asc', 'desc']}
                                    initialState={{
                                        sorting: { sortModel: [{ field: 'id', sort: 'asc' }] }
                                    }}
                                    checkboxSelection
                                    disableColumnMenu
                                    disableRowSelectionOnClick
                                    rowSelectionModel={selection}
                                    onRowSelectionModelChange={(model) => setSelection(model)}
                                    getRowId={(row) => row.id}
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

