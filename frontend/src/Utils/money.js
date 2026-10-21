export const peso = (amount) => {
    const value = Number(amount)
    if (Number.isNaN(value)) return '₱0.00'
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(value)
}
