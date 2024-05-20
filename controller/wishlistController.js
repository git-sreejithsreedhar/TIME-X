const User  = require('../model/user')
const Products  = require('../model/products')
const Category = require('../model/category')
const Brand = require('../model/brand')
const Cart = require('../model/cart')
const Order = require('../model/order')
const Wishlist = require('../model/wishlist')
const Coupon = require('../model/coupon')


const isUser = require('../middlewares/isUser')
const wishlist = require('../model/wishlist')


wishlistController = {


    getWishlist : async (req, res, next) => {
        try {
            const userId = req.session.user._id;
            
            const wishlist = await Wishlist.findOne({ userId: userId }).populate('items.product');
    
            if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
                return res.render('user/wishlist', {
                    title: 'Wishlist',
                    user: req.session,
                    wishlist: null
                });
            }
    
            // Sort wishlist items by wishlistDate
            wishlist.items.sort((a, b) => b.wishlistDate - a.wishlistDate);
    
            res.render('user/wishlist', {
                title: 'Wishlist',
                wishlist: wishlist,
                user: req.session.user
            });
        } catch (error) {
            next(error);
        }
    },


    

  
    
    // postAddToWishlist: async (req, res, next) => {
    //     try {

    //         if (!req.session.user) {
    //             return res.status(400).json({ success: false, message: "Please log in to add items to your cart" })
    //         }

    //         const userId = req.session.user._id;
    //         const productId = req.params.id;
    //         const quantity = 1;


    //         const product = await Products.findById(productId);
    
    //         if (!product) {
    //             return res.status(400).json({ success: false, message: "Product not found"});
    //         }
    
    //         let userWishlist = await Wishlist.findOne({ userId: userId });
    
    //         if (!userWishlist) {
    //             const newWishlist = new Wishlist({
    //                 userId: userId,
    //                 items: [{
    //                     product: productId,
    //                     price: product.price,
    //                     quantity: quantity  // Add quantity field here if necessary
    //                 }]
    //             });
    
    //             await newWishlist.save();
    //         } else {
    //             const existingProduct = userWishlist.items.find(
    //                 (item) => item.product.toString() === productId.toString()
    //             );
    
    //             if (existingProduct) {
    //                 return res.status(400).json({ success: false, message: "Product already exists." });  
    //             } else {
    //                 userWishlist.items.push({
    //                     product: productId,
    //                     price: product.price,
    //                     quantity: quantity  // Add quantity field here if necessary
    //                 });
    
    //                 await userWishlist.save();
    //             }
    //         }
    
    //         return res.status(200).json({ success: true, message: "Added to Wishlist." });
    
    //     } catch(error) {
    //         next(error);
    //     }

    postAddToWishlist: async (req, res, next) => {
        try {
            // Check if the user is logged in
            if (!req.session.user) {
                return res.status(401).json({ success: false, message: "Please log in to add items to your wishlist" });
            }
    
            const userId = req.session.user._id;
            const productId = req.params.id;
            const quantity = 1;
    
            const product = await Products.findById(productId);
    
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
    
            let userWishlist = await Wishlist.findOne({ userId: userId });
    
            if (!userWishlist) {
                const newWishlist = new Wishlist({
                    userId: userId,
                    items: [{
                        product: productId,
                        price: product.price,
                        quantity: quantity
                    }]
                });
    
                await newWishlist.save();
            } else {
                const existingProduct = userWishlist.items.find(
                    (item) => item.product.toString() === productId.toString()
                );
    
                if (existingProduct) {
                    return res.status(400).json({ success: false, message: "Product already exists in wishlist" });
                } else {
                    userWishlist.items.push({
                        product: productId,
                        price: product.price,
                        quantity: quantity
                    });
    
                    await userWishlist.save();
                }
            }
    
            return res.status(200).json({ success: true, message: "Added to Wishlist." });
    
        } catch(error) {
            next(error);
        }
    },

    deleteWishlist: async (req, res, next) => {
        try {
            const userId = req.session.userID;
            const productId = req.params.Id;

            const userWishlist = await Wishlist.findOne({ userId: userId })

            if (userWishlist) {
                const wishlistProductIndex = userWishlist.items.findIndex(item => item.product.toString() === productId);
    
                if (wishlistProductIndex !== -1) {
                    userWishlist.items.splice(wishlistProductIndex, 1);
                    
                    await userWishlist.save();
    
                    res.json({ success: true });
                } else {
                    res.json({ success: false, message: 'Product not found in the wishlist' });
                }
            } else {
                res.json({ success: false, message: 'Wishlist not found' });
            }
        } catch (err) {
            next(err);
        }
    },
    
   
    

    


}

module.exports = wishlistController;