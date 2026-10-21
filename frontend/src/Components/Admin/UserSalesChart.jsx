import React, { useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import axios from 'axios'
import Loader from '../Layout/Loader'
import { peso } from '../../Utils/money'

const colors = ['#111111', '#c8102e', '#3d405b', '#81b29a', '#e07a5f', '#6d597a', '#355070', '#b56576']

const UserSalesChart = ({ range = {} }) => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const params = new URLSearchParams()
                if (range.start) params.set('start', range.start)
                if (range.end) params.set('end', range.end)
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/customer-sales?${params.toString()}`)
                const rows = (data.customerSales || []).map((item) => ({
                    name: item.userDetails?.name || 'Customer',
                    total: Number(item.total) || 0
                }))
                setSales(rows)
            } catch (error) {
                setSales([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [range.start, range.end])

    if (loading) return <Loader />
    if (!sales.length) return <p className="chart-empty">No customer sales yet.</p>

    return (
        <ResponsiveContainer width="100%" height={360}>
            <BarChart data={sales} margin={{ top: 12, right: 8, left: 8, bottom: 24 }} barCategoryGap="28%">
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 12, fill: '#333' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e6e2dc' }}
                    height={48}
                />
                <YAxis
                    tickFormatter={(value) => peso(value)}
                    width={96}
                    tick={{ fontSize: 12, fill: '#333' }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip formatter={(value) => [peso(value), 'Sales']} cursor={{ fill: 'rgba(17,17,17,0.04)' }} />
                <Bar dataKey="total" name="Sales" maxBarSize={56} radius={[8, 8, 0, 0]}>
                    {sales.map((item, index) => (
                        <Cell key={item.name} fill={colors[index % colors.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export default UserSalesChart
