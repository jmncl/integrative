const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const {
    newProduct,
    getSingleProduct,
    getProducts,
    getAdminProducts,

    updateProduct,
    deleteProduct,
    deleteProducts,
    restoreProducts,
    getProductReviews,
    getAdminReviews,
    createProductReview,
    deleteReview,
    deleteReviews,
    restoreReviews,
    productSales,
    newOffer,
    myOffers,
    deleteMyOffers,
    restoreMyOffers,
    getPendingOffers,
    reviewOffer,

} = require('../controllers/product');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

// router.post('/admin/product/new', upload.array('images', 10), newProduct);
router.post('/admin/product/new', isAuthenticatedUser, upload.array('images', 10), newProduct);
router.get('/product/:id', getSingleProduct)
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);

router.put('/admin/product/:id', upload.array('images', 10), updateProduct);
router.delete('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), deleteProducts);
router.put('/admin/products/restore', isAuthenticatedUser, authorizeRoles('admin'), restoreProducts);
router.delete('/admin/product/:id', deleteProduct);

router.get('/products', getProducts)
router.post('/offer', isAuthenticatedUser, newOffer)
router.get('/offers/me', isAuthenticatedUser, myOffers)
router.delete('/offers/me', isAuthenticatedUser, deleteMyOffers)
router.put('/offers/me/restore', isAuthenticatedUser, restoreMyOffers)
router.get('/admin/offers', isAuthenticatedUser, authorizeRoles('admin'), getPendingOffers)
router.put('/admin/offer/:id', isAuthenticatedUser, authorizeRoles('admin'), reviewOffer)

router.put('/review', isAuthenticatedUser, createProductReview);
router.get('/admin/reviews', isAuthenticatedUser, authorizeRoles('admin'), getAdminReviews)
router.get('/reviews', isAuthenticatedUser, getProductReviews)
router.delete('/reviews', isAuthenticatedUser, authorizeRoles('admin'), deleteReview)
router.delete('/admin/reviews', isAuthenticatedUser, authorizeRoles('admin'), deleteReviews)
router.put('/admin/reviews/restore', isAuthenticatedUser, authorizeRoles('admin'), restoreReviews)
router.get('/admin/product-sales', productSales);
module.exports = router