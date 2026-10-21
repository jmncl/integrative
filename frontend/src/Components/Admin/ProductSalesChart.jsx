import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Loader from '../Layout/Loader'
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const colors = [
    '#111111', '#c8102e', '#3d405b', '#81b29a', '#e07a5f',
    '#6d597a', '#e9c46a', '#355070', '#b56576', '#2a9d8f',
    '#f4a261', '#264653', '#9a8c98', '#6b705c'
]

export default function ProductSalesChart({ range = {} }) {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const params = new URLSearchParams()
                if (range.start) params.set('start', range.start)
                if (range.end) params.set('end', range.end)
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/product-sales?${params.toString()}`)
                setSales(data.totalPercentage || [])
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
        <div className="chart-split">
            <div className="chart-pie">
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={sales}
                            dataKey="percent"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={100}
                            paddingAngle={1}
                            stroke="#fff"
                        >
                            {sales.map((entry, index) => (
                                <Cell key={entry.name} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <ul className="chart-legend">
                {sales.map((item, index) => (
                    <li key={item.name}>
                        <span className="swatch" style={{ background: colors[index % colors.length] }} />
                        <span className="legend-name">{item.name}</span>
                        <span className="legend-value">{item.percent}%</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
