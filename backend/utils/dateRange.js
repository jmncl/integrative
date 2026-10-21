const paidAtMatch = (query = {}) => {
    const paidAt = {}
    if (query.start) {
        const start = new Date(query.start)
        if (!Number.isNaN(start.getTime())) paidAt.$gte = start
    }
    if (query.end) {
        const end = new Date(query.end)
        if (!Number.isNaN(end.getTime())) {
            end.setHours(23, 59, 59, 999)
            paidAt.$lte = end
        }
    }
    return Object.keys(paidAt).length ? { $match: { paidAt } } : null
}

module.exports = { paidAtMatch }
