const express = require('express')

const isAuth = require('../middlewares/auth')
const authController = require('../middlewares/auth')


const userController = require('../controller/userController')
const product = require('../model/products')
const category = require('../model/category')
const brand = require('../model/brand')
const cartController = require('../controller/cartController')
const addressController = require('../controller/addressController')
const orderController = require('../controller/orderController')
const wishlistController = require('../controller/wishlistController')
const router = express.Router()


const isUser = require('../middlewares/isUser')



router.get('/userHome',userController.userhome)

router.get('/user/register', userController.getuserRegister)
router.post('/user/register', userController.postuserRegister)
// router.post('/validateReferralCode/:Id', userController.validateReferralCode)

router.get('/auth/google',authController.googleAuth)
router.get('/auth/google/callback',authController.googleAuthCallback)



router.post('/sendOtp',userController.postsendotp)
router.post('/verifyOtp',userController.postverifyotp)
router.post('/resendOtp',userController.resendotp)


router.get('/user/login', userController.getuserLogin)
router.post('/user/login', userController.postuserLogin)
router.get('/logout',userController.getlogout)

router.get('/user/shop', userController.getshopPage)
router.get('/priceFilter/:category?',userController.getshopPage);
router.get('/categoryFilter/:category?', userController.getshopPage);

// router.get('/search',userController.search)
router.get('/user/productdetails/:id', userController.getuserproductdetails)


router.get('/user/cart', isUser, userController.getCart)
router.post('/user/addtocart/:id', isUser, userController.postaddtoCart);
router.delete('/user/cart-remove-product/:id',cartController.deleteProductCart )
router.post('/update-cart',cartController.postupdatecart)




router.get('/user/address', addressController.getAddress)
router.get('/addaddress',isUser,addressController.addaddress)
router.post('/address-add',isUser,addressController.postaddaddress)
router.get('/user/editAddress/:id', addressController.getEditAddress)
router.post('/user/edit-Address/:id', isUser, addressController.postEditAddress)
router.delete('/user/removeAddress/:id', addressController.deleteAddress)


router.get('/user/dashboard', isUser, userController.getDashboard)
router.get('/user/profile', userController.getUserProfile)
router.get('/user/edit-profile', userController.getEditProfile)
router.post('/user/edit-profile', userController.postEditProfile)

router.post('/user/change-password', userController.postChangePassword)


router.get('/user/checkout', isUser, orderController.getCheckout);
router.post('/placeorder',isUser,orderController.postcheckout)


router.get('/user/myOrders', isUser, orderController.getMyOrders)
router.get('/user/orderdetails/:Id', isUser, orderController.getOrderDetails)
router.patch('/user/cancel-order', isUser, orderController.cancelOrders)
router.patch('/returnorder', isUser, orderController.returnOrtders)



router.get('/user/wishlist', isUser, wishlistController.getWishlist)
router.post('/user/addToWishlist/:id', isUser, wishlistController.postAddToWishlist)
router.delete('/remove-from-wishlist/:Id',wishlistController.deleteWishlist)

router.post('/validate-coupon', orderController.checkCoupon)
router.post('/apply-Coupon', orderController.applyCoupon)

router.get('/user/wallet', isUser, userController.getWallet)
router.post('/walletdeposite', isUser, userController.postAddAmount)
router.post('/check-wallet-balance', isUser,userController.checkWalletBalance)

router.get('/downloadinvoice/:Id',isUser,orderController.getOrderInvoice)

// ---------------------------------------------------------------------------------


module.exports = router