const User  = require('../model/user')
const Products  = require('../model/products')
const Category = require('../model/category')
const Brand = require('../model/brand')
const passport = require('passport')
const Cart = require('../model/cart')
const Order = require('../model/order')
const Address = require('../model/address')
const Coupon = require('../model/coupon')
const Wallet  =require('../model/wallet')


require('dotenv').config()

const isUser = require('../middlewares/isUser')
const isAuth = require('../middlewares/auth')
const Razorpay = require('razorpay');

const ejs = require('ejs');
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer-core');
const path = require('path');
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const { log } = require('console')

// const transporter = require('transporter')



const razorpay = new Razorpay({
    key_id: 'RAZORPAY_KEY_ID',
    key_secret: 'RAZORPAY_KEY_SECRET'
});



const orderController = {

    getCheckout: async (req, res, next) => {
        try {
            
            // Retrieve the itemId from the query parameters
            const itemId = req.query.itemId;
            const coupons = await Coupon.find({});

    
            // Check if itemId exists
            if (itemId) {
                const userId = req.session.userID;
    
                // Fetch the user's cart based on the itemId
                const userCart = await Order.findById(itemId).populate({ path: 'items.product', model: 'Product' });
    
                // Fetch the user's addresses
                const addressDocument = await Address.findOne({ userId: userId });
    
                // Extract addresses from the document or initialize as an empty array
                const addresses = addressDocument ? addressDocument.addresses || [] : [];
    
                // Render the checkout page with cart details and addresses
                res.render('user/checkout', {
                    title: 'Checkout',
                    user: req.session.user || req.user,
                    userCart,
                    addresses,
                    userData: req.session.user,
                    coupon: coupons
                });
            } else {
      
                // If itemId doesn't exist, assume the user is proceeding from their cart
    
                const userId = req.session.user._id;
    
                // Fetch the user's cart
                const userCart = await Cart.findOne({ userId: userId }).populate({ path: 'items.product', model: 'Product' });
    
                // Fetch the user's addresses
                const addressDocument = await Address.findOne({ userId: userId });
    
                // Extract addresses from the document or initialize as an empty array
                const addresses = addressDocument ? addressDocument.addresses || [] : [];
    
                // Render the checkout page with cart details and addresses
                res.render('user/checkout', {
                    title: 'Checkout',
                    user: req.session.user || req.user,
                    userCart,
                    addresses,
                    userData: req.session.user,
                    coupon: coupons
                });
            }
        } catch (err) {
            // Pass any errors to the error handling middleware
            next(err);
        }
    },

    // postcheckout: async (req, res, next) => {
    //     try {
    //         const itemId = req.body.orderId;
    //         const userId = req.session.user._id;
    //         const existingOrder = await Order.findOne({ _id: itemId });
    
    //         if (existingOrder) {
    //             await Order.findOneAndUpdate(
    //                 { _id: itemId },
    //                 { paymentStatus: 'Paid' },
    //                 { new: true }
    //             );
    //         } else {
    //             const { addressId, paymentMethod, totalprice, paymentStatus, discount, couponamt, subtotal, coupon } = req.body;
    //             // console.log(subtotal);
    //             // console.log(couponamt);
    //             // console.log(coupon);
    //             console.log(userId)
    //             const totalprice1 = parseFloat(totalprice);
    //             const user = await User.findById(userId);
    //             const cartItems = JSON.parse(req.body.cartItem);
    //             let userAddress = await Address.findOne({ 'addresses._id': addressId });
    //             let discountAmount = parseFloat(couponamt);
    //             let totalAmount = parseFloat(subtotal);
    
    //             const address = userAddress.addresses.find((addr) => addr._id.toString() === addressId);
    //             const items = [];
    
    //             for (const item of cartItems) {
    //                 if (item.quantity) {
    //                     items.push({
    //                         product: item.product,
    //                         price: item.price,
    //                         quantity: item.quantity,
    //                     });
    //                 } else {
    //                     console.error(`Quantity missing for item ${item._id}`);
    //                 }
    //             }
    
    //             // Check if discountAmount is NaN or 0, then set it to 0
    //             if (isNaN(discountAmount) || discountAmount === 0) {
    //                 discountAmount = 0;
    //             }
    
    //             const order = new Order({
    //                 userId: user._id,
    //                 items: items,
    //                 totalprice: totalprice1,
    //                 billingdetails: {
    //                     name: user.name,
    //                     buildingname: address.buildingname,
    //                     city: address.city,
    //                     state: address.state,
    //                     country: address.country,
    //                     postalCode: address.pincode,
    //                     phone: user.phone,
    //                     email: user.email,
    //                     user: userId
    //                 },
    //                 amount: totalprice1 - discountAmount,
    //                 paymentMethod,
    //                 discountAmount: discountAmount,
    //                 paymentStatus: paymentStatus
    //             });
    
    //             await order.save();
    
               
    //         }
    
    //         if (req.body.paymentStatus === 'Failed') {
    //             res.redirect('/orders');

    //         } else {
    //             await Cart.findOneAndUpdate(
    //                 { userId: user._id },
    //                 { $set: { items: [], totalprice: 0 } }
    //             );
    
    //             for (const item of order.items) {
    //                 await Products.findByIdAndUpdate(
    //                     item.product,
    //                     { $inc: { stock: -item.quantity } },
    //                     { new: true }
    //                 );
    //             }
    
    //             if (coupon) {
    //                 await Coupon.findOneAndUpdate(
    //                     { coupon: coupon },
    //                     { $push: { userId: user } }
    //                 );
    //             }
                
    //             res.render('user/thankYou');
    //         }
    //     } catch (err) {
    //         next(err);
    //     }
    // },

    postcheckout: async (req, res, next) => {
        try {
            const itemId = req.body.orderId;
            const userId = req.session.user._id;
            const existingOrder = await Order.findOne({ _id: itemId });
    
            let order; // Declare order here
            let coupon; // Declare coupon here
    
            if (existingOrder) {
                order = await Order.findOneAndUpdate(
                    { _id: itemId },
                    { paymentStatus: 'Paid' },
                    { new: true }
                );
            } else {
                const { addressId, paymentMethod, totalprice, paymentStatus, discount, couponamt, subtotal } = req.body;
                coupon = req.body.coupon; // Assign coupon here
                const totalprice1 = parseFloat(totalprice);
                const user = await User.findById(userId);
                const cartItems = JSON.parse(req.body.cartItem);
                let userAddress = await Address.findOne({ 'addresses._id': addressId });
                let discountAmount = parseFloat(couponamt);
                let totalAmount = parseFloat(subtotal);
    
                const address = userAddress.addresses.find((addr) => addr._id.toString() === addressId);
                const items = [];
    
                for (const item of cartItems) {
                    if (item.quantity) {
                        items.push({
                            product: item.product,
                            price: item.price,
                            quantity: item.quantity,
                        });
                    } else {
                        console.error(`Quantity missing for item ${item._id}`);
                    }
                }
    
                if (isNaN(discountAmount) || discountAmount === 0) {
                    discountAmount = 0;
                }
    
                order = new Order({ // Assign order here
                    userId: user._id,
                    items: items,
                    totalprice: totalprice1,
                    billingdetails: {
                        name: user.name,
                        buildingname: address.buildingname,
                        city: address.city,
                        state: address.state,
                        country: address.country,
                        postalCode: address.pincode,
                        phone: user.phone,
                        email: user.email,
                        user: userId
                    },
                    amount: totalprice1 - discountAmount,
                    paymentMethod,
                    discountAmount: discountAmount,
                    paymentStatus: paymentStatus
                });
    
                await order.save();
            }
    
            if (req.body.paymentStatus === 'Failed') {
                res.redirect('user/myOrders');
            } else {
                await Cart.findOneAndUpdate(
                    { userId: userId },
                    { $set: { items: [], totalprice: 0 } }
                );
    
                for (const item of order.items) {
                    await Products.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: -item.quantity } },
                        { new: true }
                    );
                }
    
                if (coupon) {
                    await Coupon.findOneAndUpdate(
                        { coupon: coupon },
                        { $push: { userId: userId } }
                    );
                }
    
                res.render('user/thankYou');
            }
        } catch (err) {
            next(err);
        }
    },
    
    
    
    
    

    checkCoupon: async (req, res, next) => {
        try {
            
            const value = req.body.coupon;

            const coupon = await Coupon.findOne({ coupon: value });
            console.log(coupon._id)
            // if (coupon) {
            //     return res.status(200).json({ couponId: coupon._id });

            // } else {
            //     return res.sendStatus(404);
            // }

           

            if (coupon) {
                return res.status(200).json({ couponId: coupon._id });
            } else {
                return res.status(400).json({ message: "Coupon not found or already used" });
            }

        } catch (err) {
            next(err);
        }
    },

    applyCoupon: async (req, res, next) => {
        try {
            const user = req.session.user._id;
            const couponId = req.body.couponId;
        
            // console.log(couponId);
        
            const checkUsed = await Coupon.findOne({ userId: user });
        
            if (checkUsed) {
                return res.status(400).json({ message: "Coupon already Used" });
            }
        
            const cart = await Cart.findOne({ userId: user });
            let totalAmount = cart.totalprice;
        
            const coupon = await Coupon.findOne({ _id: couponId });
        
            if (!coupon) {
                return res.status(404).json({ message: "Coupon not found" });
            }
        
            const percentAmount = Math.ceil((totalAmount * coupon.percentage) / 100);
        
            if (totalAmount > coupon.maximumamount) {
                const amountToPay = totalAmount - coupon.maximumamount;
        
                
        
                return res.status(200).json({ totalAmount: amountToPay, couponId: req.body.couponCode, discountAmount: coupon.maximumamount });
            } else {
                const amountToPay = totalAmount - percentAmount;
        
                
        
                return res.status(200).json({ totalAmount: amountToPay, couponId: req.body.couponCode, discountAmount: percentAmount });
            }
        } catch (error) {
            next(error);
        }
 
    },
    


// get orders
getMyOrders: async (req,res,next) =>{
    try{

        // console.log(req.session.user)
        const userId = req.session.user._id;
        // console.log(userId)
        const page = parseInt(req.query.page) || 1; 
        const limit = 10; 
        const skip = (page - 1) * limit;

        const totalItems = await Order.countDocuments({userId : userId});
        const totalPages = Math.ceil(totalItems / limit);

        const orders = await Order.find({userId : userId}).skip(skip).limit(limit).populate('items.product').sort({ orderDate : -1 })

        
        res.render('user/myOrders', {
            title: 'My orders',
            user: req.session,
            order: orders,
            totalPages: totalPages,
            currentPage: page
        });
    }
    catch(err){
        next(err)
    }
},


getOrderDetails : async (req, res, next) => {
    try {

        const orderId = req.params.Id
            const userId = req.session.user._id
            const orders = await Order.findOne({ _id : orderId}).populate('items.product')
            const user = await Order.findOne({ userId : userId })
            
        
            res.render('user/orderDetails',{
                title: 'Order Detials',
                user: req.session,
                order: orders,
                users: user,
            })

    }
    catch(error) {
        next(error)
    }
},


cancelOrders: async (req, res, next) => {
    try {
        const userId = req.session.user._id
        const userWallet = await Wallet.findOne({userId : userId})
        const { orderId, productId } = req.body;
        console.log(orderId);
        console.log(productId);

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const cancelProduct = order.items.find(item => item.product.toString() === productId)

        if (!cancelProduct) {
            return res.status(404).json({ message: 'Product not found in order' });
        }

        await Products.findByIdAndUpdate(cancelProduct.product, { $inc: { stock: cancelProduct.quantity } });
        

        cancelProduct.status = 'Cancelled';
        await order.save();

        let finalAmount

        if (order.discountAmount > 0) {
            let divededAmount = order.discountAmount / order.items.length
            finalAmount = cancelProduct.price - divededAmount
        } else {
            finalAmount = cancelProduct.price
        }

        userWallet.balance += cancelProduct.price;
        await userWallet.save();

        // const transaction = new Transaction({
        //     userId: userId,
        //     amount: finalAmount,
        //     type: 'Credit', 
        //     status: 'Refunded',
        //     date: new Date() 
        // });

        // await transaction.save();

        res.status(200).json({ message: 'Product Cancelled Successfully', cancelProduct });
        

    }
    catch(error) {
        next(error)
    }
},

// return orders------------------------------
returnOrtders: async (req, res, next) => {
    try {
        const userId = req.session.userID 
        const userWallet = await Wallet.findOne({userId : userId})
        const { orderId, productId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const cancelProduct = order.items.find(item => item.product.toString() === productId)

        if (!cancelProduct) {
            return res.status(404).json({ message: 'Product not found in order' });
        }

        await Products.findByIdAndUpdate(cancelProduct.product, { $inc: { stock: cancelProduct.quantity } });
        

        cancelProduct.status = 'Returned';
        await order.save();

        let finalAmount

        if (order.discountAmount > 0) {
            let divededAmount = order.discountAmount / order.items.length
            finalAmount = cancelProduct.price - divededAmount
        } else {
            finalAmount = cancelProduct.price
        }

        userWallet.balance += cancelProduct.price;
        await userWallet.save();

        // const transaction = new Transaction({
        //     userId: userId,
        //     amount: finalAmount,
        //     type: 'Credit', 
        //     status: 'Refunded',
        //     date: new Date() 
        // });

        // await transaction.save();

        res.status(200).json({ message: 'Product Cancelled Successfully', cancelProduct });
    }
    catch(error) {
        next(error)
    }
},


// Download invoice------------------------

    getOrderInvoice: async (req, res, next) => {
        try {
            const categoryData = await Category.find({ isListed: true });
            const orderId = req.params.Id;
            const userId = req.session.userID;

            // Fetch order and user details
            const order = await Order.findOne({ _id: orderId }).populate('items.product');
            const user = await Order.findOne({ userId: userId });

            if (!order || !user) {
                return res.status(404).send('Order or user not found');
            }

            // Render invoice HTML using EJS template
            const invoiceTemplatePath = path.join(__dirname, '..', 'views', 'user', 'invoice.ejs');
            const invoiceHtml = await ejs.renderFile(invoiceTemplatePath, { order, user });

            // Path to save the PDF file
            const pdfPath = path.join(__dirname, '..', 'views', 'invoice.pdf');

            // Launch Puppeteer to generate PDF
            const browser = await puppeteer.launch({
                headless: true,
                executablePath: '/usr/bin/chromium-browser',  // Ensure this path is correct
                args: ["--disable-setuid-sandbox", "--no-sandbox", "--disable-gpu"],
            });

            const page = await browser.newPage();
            await page.setContent(invoiceHtml);
            await page.pdf({ path: pdfPath, format: 'A4' });
            await browser.close();

            // Send the generated PDF file to the client
            res.download(pdfPath, 'invoice.pdf', (err) => {
                if (err) {
                    console.error('Error sending the file:', err);
                    return next(err);
                }
                fs.unlinkSync(pdfPath); // Delete the PDF file after sending it
            });

        } catch (error) {
            console.error('Error generating the invoice:', error);
            next(error);
        }
    }







}
module.exports = orderController





