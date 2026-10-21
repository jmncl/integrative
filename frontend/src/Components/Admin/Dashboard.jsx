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
                        <MonthlySalesChart range={range} />
                    </section>
                    <section className="panel">
                        <h2>Sales by product</h2>
                        <ProductSalesChart range={range} />
                    </section>
                    <section className="panel">
                        <h2>Sales by customer</h2>
                        <UserSalesChart range={range} />
                    </section>
                </div>
            </div>
        </>
    )
}

export default Dashboard
