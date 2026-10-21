import { useState } from 'react'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import ProductSalesChart from './ProductSalesChart';
import UserSalesChart from './UserSalesChart';
import MonthlySalesChart from './MonthlySalesChart';

const Dashboard = () => {
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')
    const range = { start, end }

    return (
        <>
            <MetaData title={'Admin Dashboard'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <div className="page-head">
                        <h1 className="page-title">Dashboard</h1>
                        <div className="date-range">
                            <label>From <input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
                            <label>To <input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
                        </div>
                    </div>
                    <section className="panel">
                        <h2>Monthly sales</h2>
                        <p className="panel-note">Paid orders, oldest month to newest.</p>
                        <MonthlySalesChart range={range} />
                    </section>
                    <div className="dash-grid">
                        <section className="panel">
                            <h2>Top products</h2>
                            <p className="panel-note">Highest sales first. The eight leaders in this range.</p>
                            <ProductSalesChart range={range} />
                        </section>
                        <section className="panel">
                            <h2>Top customers</h2>
                            <p className="panel-note">Highest spend first. The eight leaders in this range.</p>
                            <UserSalesChart range={range} />
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
