import { useState, useEffect } from 'react'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
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
            <p className="chart-total">{peso(total)} <span>from paid orders in this range</span></p>
            <p className="panel-note">Each bar is one month. A short bar means fewer paid orders. A month with no sales stays at zero.</p>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sales} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke="#eee" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#333' }} tickLine={false} axisLine={{ stroke: '#e6e2dc' }} />
                    <YAxis tickFormatter={(value) => peso(value)} width={96} tick={{ fontSize: 12, fill: '#333' }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => [peso(value), 'Sales']} />
                    <Bar dataKey="total" fill="#c8102e" radius={[6, 6, 0, 0]} maxBarSize={42} />
                </BarChart>
            </ResponsiveContainer>
        </>
    )
}
