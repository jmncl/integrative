import { useEffect, useMemo, useRef, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'

const CAP = 100
const STEP = 20

const compareValue = (left, right) => {
    if (typeof left === 'number' && typeof right === 'number') return left - right
    return String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true, sensitivity: 'base' })
}

const sortRows = (rows, model) => {
    if (!model?.length) return rows
    const { field, sort } = model[0]
    const direction = sort === 'desc' ? -1 : 1
    return [...rows].sort((a, b) => direction * compareValue(a[field], b[field]))
}

const ScrollTable = ({ rows = [], resetKey = '', initialState, pageSizeOptions, ...props }) => {
    const box = useRef(null)
    const lock = useRef(false)
    const nudge = useRef(null)
    const [sortModel, setSortModel] = useState(initialState?.sorting?.sortModel || [])
    const [from, setFrom] = useState(0)
    const [size, setSize] = useState(STEP)
    const sorted = useMemo(() => sortRows(rows, sortModel), [rows, sortModel])
    const shown = sorted.slice(from, from + size)
    const pageSize = Math.max(Math.min(shown.length, CAP), 1)
    const rowHeight = props.rowHeight || 52

    useEffect(() => {
        setSortModel(initialState?.sorting?.sortModel || [])
        setFrom(0)
        setSize(STEP)
    }, [resetKey])

    useEffect(() => {
        const root = box.current
        const scroller = root?.querySelector('.MuiDataGrid-virtualScroller')
        if (!scroller) return undefined
        const onScroll = () => {
            if (lock.current) return
            const nearBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 48
            const nearTop = scroller.scrollTop <= 12
            const total = sorted.length
            if (nearBottom && from + size < total) {
                lock.current = true
                nudge.current = 'down'
                if (from === 0 && size < CAP) setSize(current => Math.min(CAP, current + STEP, total))
                else setFrom(current => Math.min(current + STEP, Math.max(total - size, 0)))
                return
            }
            if (nearTop && from > 0) {
                lock.current = true
                nudge.current = 'up'
                setFrom(current => Math.max(0, current - STEP))
            }
        }
        scroller.addEventListener('scroll', onScroll)
        return () => scroller.removeEventListener('scroll', onScroll)
    }, [from, size, sorted.length])

    useEffect(() => {
        const scroller = box.current?.querySelector('.MuiDataGrid-virtualScroller')
        if (!scroller || !nudge.current) {
            lock.current = false
            return
        }
        const shift = STEP * rowHeight
        scroller.scrollTop = nudge.current === 'down'
            ? Math.max(0, scroller.scrollTop - shift)
            : scroller.scrollTop + shift
        nudge.current = null
        lock.current = false
    }, [from, size, rowHeight])

    return (
        <div className="scroll-table" ref={box}>
            <DataGrid
                {...props}
                rows={shown}
                sortModel={sortModel}
                onSortModelChange={(model) => {
                    setSortModel(model)
                    setFrom(0)
                    setSize(STEP)
                }}
                hideFooter
                disableColumnMenu
                pageSizeOptions={[pageSize]}
                paginationModel={{ page: 0, pageSize }}
                onPaginationModelChange={() => {}}
            />
        </div>
    )
}

export default ScrollTable
