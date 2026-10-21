import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Loader from '../Layout/Loader'
import { peso } from '../../Utils/money'

const shorten = (name) => name.length > 26 ? `${name.slice(0, 24)}…` : name

export default function ProductSalesChart({ range = {} }) {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (range.start) params.set('start', range.start)
                if (range.end) params.set('end', range.end)
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/product-sales?${params.toString()}`)
                const rows = (data.totalPercentage || [])
                    .map(item => ({
                        name: item.name,
                        label: shorten(item.name),
                        total: Number(item.total) || 0,
                        percent: item.percent
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
    if (!sales.length) return <p className="chart-empty">No product sales yet.</p>

    return (
        <ResponsiveContainer width="100%" height={Math.max(220, sales.length * 42)}>
            <BarChart data={sales} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }} barCategoryGap="22%">
                <XAxis type="number" tickFormatter={(value) => peso(value)} tick={{ fontSize: 12, fill: '#333' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 12, fill: '#333' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value, _name, item) => [`${peso(value)} · ${item?.payload?.percent || 0}%`, item?.payload?.name || 'Sales']} />
                <Bar dataKey="total" name="Sales" fill="#111111" radius={[0, 8, 8, 0]} maxBarSize={22} />
            </BarChart>
        </ResponsiveContainer>
    )
}
