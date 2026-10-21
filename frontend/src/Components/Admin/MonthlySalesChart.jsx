import React, { useState, useEffect } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from "axios";
import Loader from '../Layout/Loader';
import { peso } from '../../Utils/money';

export default function MonthlySalesChart({ range = {} }) {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const monthlySales = async () => {
        try {
            const params = new URLSearchParams()
            if (range.start) params.set('start', range.start)
            if (range.end) params.set('end', range.end)
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month?${params.toString()}`)
            setSales(data.salesPerMonth)
            // console.log(data.salesPerMonth)
            setLoading(false)

        } catch (error) {
            setError(error.response.data.message)
        }
    }
    useEffect(() => {
        monthlySales()

    }, [range.start, range.end])

    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="total" stroke="#c8102e" strokeWidth={2} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => peso(value)} width={90} />
                <Tooltip formatter={(value) => peso(value)} />
            </LineChart>
        </ResponsiveContainer>
    );
}