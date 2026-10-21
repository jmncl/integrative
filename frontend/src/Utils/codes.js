export const productCode = (product) => product?.code || (product?._id ? `JB${product._id}` : '')
export const orderCode = (order) => order?.code || (order?._id ? `JO${order._id}` : '')
