import { useState, useEffect } from 'react'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import Loader from '../Layout/Loader'
import { peso } from '../../Utils/money'

export default function MonthlySalesChart({ range = {} }) {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (range.start) params.set('start', range.start)
                if (range.end) params.set('end', range.end)
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month?${params.toString()}`)
                setSales(data.salesPerMonth || [])
            } catch (error) {
                setSales([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [range.start, range.end])

    if (loading) return <Loader />
    if (!sales.length) return <p className="chart-empty">No sales in this range.</p>

    const total = sales.reduce((sum, item) => sum + Number(item.total || 0), 0)

    return (
        <>
            <p className="chart-total">{peso(total)} <span>across {sales.length} month{sales.length === 1 ? '' : 's'}</span></p>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={sales} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
                    <defs>
                        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c8102e" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#c8102e" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#eee" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#333' }} tickLine={false} axisLine={{ stroke: '#e6e2dc' }} />
                    <YAxis tickFormatter={(value) => peso(value)} width={96} tick={{ fontSize: 12, fill: '#333' }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => [peso(value), 'Sales']} />
                    <Area type="monotone" dataKey="total" stroke="#c8102e" strokeWidth={2} fill="url(#salesFill)" />
                </AreaChart>
            </ResponsiveContainer>
        </>
    )
}
