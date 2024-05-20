
const session = require('express-session')
const Category = require('../model/category')
const Order = require('../model/order')
const Products = require('../model/products')
const User = require('../model/user')
const isAdmin = require('../middlewares/isAdmin')





const credentials = {
    email:'admin@gmail.com',
    password:'12345'
};


const adminController ={

 // Admin Home-----------------------------------------------   
 adminHome: async (req, res, next) => {
    try {
        // Fetching data
        const users = await User.find();
        const orders = await Order.find().populate('items.product').sort({ orderDate: -1 });
        const products = await Products.find();
        const categories = await Category.find(); // Ensure the correct model is used
        
        const currentDate = new Date().toISOString().split('T')[0];

        // Filter orders
        const paidOrders = orders.filter(order => order.paymentStatus === "Paid");
        const filteredOrders = orders.filter(order => order.paymentStatus !== "Failed" && order.status !== "Cancelled");
        
        // Calculate revenue
        let revenue = 0;
        paidOrders.forEach(order => {
            revenue += order.totalPrice;
        });

        // Aggregations
        const salesCount = await Order.aggregate([
            { $match: { 'items.status': 'Delivered' } },
            { $count: 'salesCount' }
        ]);

        let count = salesCount.length > 0 ? salesCount[0].salesCount : 0;

        const orderSum = await Order.aggregate([
            { $group: { _id: null, totalAmount: { $sum: '$totalprice' } } }
        ]);

        let orderAmount = orderSum.length > 0 ? orderSum[0].totalAmount : 0;

        const categoryCountResult = await Category.aggregate([
            { $count: 'totalCategories' }
        ]);

        let categoryCount = categoryCountResult.length > 0 ? categoryCountResult[0].totalCategories : 0;

        const discountSum = await Order.aggregate([
            { $group: { _id: null, discountAmount: { $sum: '$discountAmount' } } }
        ]);

        let discountAmount = discountSum.length > 0 ? discountSum[0].discountAmount : 0;

        const productsNumberResult = await Products.aggregate([
            { $count: 'totalProducts' }
        ]);

        let productsNumber = productsNumberResult.length > 0 ? productsNumberResult[0].totalProducts : 0;

        // Render the admin home page with all data
        res.render('admin/home', {
            title: 'Dashboard',
            currentDate: currentDate,
            count,
            orderAmount,
            discountAmount,
            order: orders,  // Passing the sorted orders with populated items
            productsNumber,
            categories: categoryCount,  // Passing the count of categories
            revenue: revenue.toFixed(2),
            orders: filteredOrders,
            products: products,
            users: users,
        });
    } catch (err) {
        next(err);
    }
},



// generate report
generateReport : async (req,res,next) => {
    try {
        const { startDate, endDate } = req.body;

        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);

        const orders = await Order.aggregate([
            { $match: { orderDate: { $gte: new Date(startDate), $lte: new Date(endDateObj) } } },
            { $unwind: "$items" },
            { $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "items.product"
            }},
            { $addFields: { "items.product": { $arrayElemAt: ["$items.product", 0] } }},
            { $group: {
                _id: "$_id",
                userId: { $first: "$userId" },
                items: { $push: "$items" },
                totalPrice: { $first: "$totalprice" },
                couponDiscount: { $first: "$discountAmount" },
                billingDetails: { $first: "$billingdetails" },
                paymentStatus: { $first: "$paymentStatus" },
                orderDate: { $first: "$orderDate" },
                paymentMethod: { $first: "$paymentMethod" }
            }}
        ]);

        const reportData = orders.map((order) => {
            let totalPrice = 0;
            order.items.forEach(product => {
                totalPrice += product.price * product.quantity;
            });
            return {
                orderId: order._id,
                date: order.orderDate,
                totalPrice,
                products: order.items.map(product => ({
                    productName: product.product.productname,
                    quantity: product.quantity,
                    price: product.price
                })),
                firstName: order.billingDetails.name,
                address: order.billingDetails.city,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus
            };
        });

        res.json({ reportData });
    } catch (err) {
        next(err);
    }
},

// Admin LogIn------------------------------------------------
    adminLogin: (req, res, next) => {
        try{
            res.render('admin/adminLogin')
        }
        catch(err){
            next(err)
        }
    },

// Checking Admin LogIn credentials
postAdminLogin: (req, res, next) => {
    try {
        if (req.body.email === credentials.email && req.body.password === credentials.password) {
            const admin = 'true'; 
            req.session.admin = req.body.email;
            req.session.isAdmin = admin;
            console.log(req.session.admin);
            res.redirect('/admin');
        } else {
            res.render('admin/adminLogin', { alert: 'Invalid Email or Password' });
        }
    } catch (err) {
        next(err);
    }
},

// Admin Logout
    adminlogout: (req, res, next) => {
        try {
            req.session.admin = null;
            res.render('admin/adminLogin', { alert: 'Logout Successfully' });

        } catch (err) {
            next(err);
        }
    },
    
    error:(req,res)=>{
        res.render('error404')
    },



}



module.exports = adminController;







