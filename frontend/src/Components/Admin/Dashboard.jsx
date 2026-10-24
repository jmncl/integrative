import { useState } from 'react'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import MonthlySalesChart from './MonthlySalesChart';

const localDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

const Dashboard = () => {
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')
    const [preset, setPreset] = useState('all')
    const range = { start, end }

    const pickRange = (name) => {
        const now = new Date()
        setPreset(name)
        if (name === 'year') {
            setStart(`${now.getFullYear()}-01-01`)
            setEnd(localDate(now))
            return
        }
        if (name === 'half') {
            setStart(localDate(new Date(now.getFullYear(), now.getMonth() - 5, 1)))
            setEnd(localDate(now))
            return
        }
        setStart('')
        setEnd('')
    }

    return (
        <>
            <MetaData title={'Admin Dashboard'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <div className="page-head">
                        <h1 className="page-title">Dashboard</h1>
                        <div className="date-range">
                            <div className="chart-kind">
                                <button type="button" className={preset === 'all' ? 'active' : ''} onClick={() => pickRange('all')}>All time</button>
                                <button type="button" className={preset === 'year' ? 'active' : ''} onClick={() => pickRange('year')}>This year</button>
                                <button type="button" className={preset === 'half' ? 'active' : ''} onClick={() => pickRange('half')}>Last 6 months</button>
                            </div>
                            <label>From <input type="date" value={start} onChange={(event) => { setPreset(''); setStart(event.target.value) }} /></label>
                            <label>To <input type="date" value={end} onChange={(event) => { setPreset(''); setEnd(event.target.value) }} /></label>
                        </div>
                    </div>
                    <section className="panel">
                        <h2>Monthly sales</h2>
                        <MonthlySalesChart range={range} />
                    </section>
                </div>
            </div>
        </>
    )
}

export default Dashboard
