
const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const categoryController = require('../controller/categoryController');
const brandController = require('../controller/brandController');
const productController = require('../controller/productController');
const adminOrderController = require('../controller/adminOrderController');
const customerController = require('../controller/customerController');
const isAdmin = require('../middlewares/isAdmin');

router.get('/admin',isAdmin, adminController.adminHome);
router.post('/generate-report',adminController.generateReport)
// router.get('/fetchdashboard',isAdmin,adminController.fetchdashboard)
// router.get("/dashboard",isAdmin,adminController.adminHome)

router.get('/admLogin', adminController.adminLogin);
router.post('/submit', adminController.postAdminLogin);
router.get('/admin/logout', adminController.adminlogout);

router.get('/admin/category', isAdmin, categoryController.getCategories); 
router.get('/admin/category/add',isAdmin, categoryController.getAddcategory); 
router.post('/submit/category', categoryController.postAddcategory);
router.get('/admin/category/edit/:Id',isAdmin,categoryController.getEditcategory)
router.post('/update/:Id',categoryController.postEditcategory)
router.get('/published/:Id',categoryController.publishcategory)
router.get('/unpublished/:Id',categoryController.unpublishcategory)

router.get('/admin/brand',isAdmin,brandController.getbrand)
router.get('/admin/brand/add',isAdmin,brandController.getaddBrand)
router.post('/submited',brandController.postaddbrand)
router.get('/admin/brand/edit/:Id',brandController.getEditbrand)
router.post('/updates/:Id',brandController.postEditbrand)
router.get('/publish/:Id',isAdmin,brandController.publishbrand)
router.get('/unpublish/:Id',brandController.unpublishbrand)


router.get('/admin/products', isAdmin, productController.getproducts);
router.get('/admin/addProducts', isAdmin, productController.getAddProducts)
router.post('/productsubmit',productController.postAddProducts)
router.get('/publish/product/:Id',isAdmin,productController.publishProduct)
router.get('/unpublish/product/:Id',isAdmin,productController.unpublishProduct)
router.get('/admin/product/edit/:Id', isAdmin, productController.getEditProducts)
router.post('/editproductsubmit/:Id', isAdmin, productController.postEditProduct)

router.get('/admin/getOrder', isAdmin, adminOrderController.getOrder)
router.get('/admin/orderDetails/:Id', isAdmin, adminOrderController.getOrderDetails)
router.patch('/updatestatus',isAdmin, adminOrderController.updateStatus)


router.get('/admin/customer', isAdmin, customerController.getCustomerdetails)
router.get('/block/:userId',isAdmin,customerController.blockuser)
router.get('/unblock/:userId',isAdmin,customerController.unblockuser)

router.get('/admin/coupon', isAdmin, adminOrderController.getCoupon)
router.get('/admin/addCoupon', isAdmin, adminOrderController.getAddCoupon)
router.post('/admin/postAddCoupon', isAdmin, adminOrderController.postAddCoupon)
// router.get('/couponpublishedd/:Id',isAdmin,isAdmin,adminController.publishcoupon)
// router.get('/couponunpublishedd/:Id',isAdmin,adminController.unpublishcoupon)
router.post('/couponpubunpub/:Id',isAdmin,adminOrderController.pubUnpub)

// router.get('/admin/sales', isAdmin, adminController.getSales)


module.exports = router;
