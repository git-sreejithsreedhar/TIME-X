const User  = require('../model/user')
const Products  = require('../model/products')
const Category = require('../model/category')
const Brand = require('../model/brand')
const Cart = require('../model/cart')
const Order = require('../model/order')
const Coupon = require('../model/coupon')


const isUser = require('../middlewares/isUser')




cartController =  {

    deleteProductCart : async (req, res, next) => {
        try {
            const userId = req.session.user._id;
            const productId = req.params.id;
            

            const userCart = await Cart.findOne({ userId: userId })
        

            if (userCart) {
                const cartProductIndex = userCart.items.findIndex(item => item.product.toString() === productId);
    
                if (cartProductIndex !== -1) {
                    const deletedProductQuantity = userCart.items[cartProductIndex].quantity;
                    userCart.items.splice(cartProductIndex, 1);
                    userCart.totalprice = userCart.items.reduce((total, item) => total + item.price * item.quantity, 0)
                    console.log(deletedProductQuantity)
                    await userCart.save();
                    await Products.findByIdAndUpdate(productId, { $inc: { stock: deletedProductQuantity} });
    
                    res.json({ success: true });
                } else {
                    res.json({ success: false, message: 'Product not found in the cart' });
                }
            } else {
                res.json({ success: false, message: 'Cart not found' });
            }
        } catch (err) {
            next(err);
        }
    },



    postupdatecart : async (req, res, next) => {
        try{
            const userId = req.session.userID;
            const action = req.body.action;
            const productId = req.body.productId;


            const userCart = await Cart.findOne({ userId }).populate('items.product');

            if (!userCart) {
                return res.json({ success: false, message: "User cart not found" });
            }

            const cartItem = userCart.items.find(item => item.product._id.toString() === productId);

            if (!cartItem) {
                return res.json({ success: false, message: "Product not found in the cart" });
            }

            const product = await Products.findById(productId);
            const maxQuantity = product.stock;

            if (action === 'increment') {
                if (cartItem.quantity < maxQuantity) {
                    cartItem.quantity += 1;
                } else {
                    return res.json({
                        success: false,
                        message: "Maximum quantity reached for this product",
                    });
                }
            } else if (action === 'decrement') {
                if (cartItem.quantity > 0) {
                    cartItem.quantity -= 1;
                } else {
                    return res.json({
                        success: false,
                        message: "Quantity cannot be less than zero",
                    });
                }
            } else {
                return res.json({
                    success: false,
                    message: "Invalid action",
                });
            }

            userCart.totalprice = userCart.items.reduce((total, item) => 
                 total + item.price * item.quantity
            , 0)

            await userCart.save();
            return res.json({
                success: true,
                cartItem: cartItem,
                totalprice: userCart.totalprice
            });
            
        }
        catch(err){
            next(err)
        }
    },


    
   

}

module.exports = cartController;