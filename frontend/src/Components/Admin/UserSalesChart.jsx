import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import Loader from '../Layout/Loader'
import { peso } from '../../Utils/money'

const UserSalesChart = ({ range = {} }) => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (range.start) params.set('start', range.start)
                if (range.end) params.set('end', range.end)
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/customer-sales?${params.toString()}`)
                const rows = (data.customerSales || [])
                    .map((item) => ({
                        name: item.userDetails?.name || 'Customer',
                        total: Number(item.total) || 0
                    }))
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 8)
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
        <ResponsiveContainer width="100%" height={Math.max(220, sales.length * 42)}>
            <BarChart data={sales} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }} barCategoryGap="22%">
                <XAxis type="number" tickFormatter={(value) => peso(value)} tick={{ fontSize: 12, fill: '#333' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12, fill: '#333' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [peso(value), 'Sales']} />
                <Bar dataKey="total" name="Sales" fill="#c8102e" radius={[0, 8, 8, 0]} maxBarSize={22} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default UserSalesChart
