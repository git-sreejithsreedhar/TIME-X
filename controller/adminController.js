
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

            const ordersPie = await chart()
            const ordersGraph = await monthgraph();
            const ordersYearGraph = await yeargraph();

      
        const users = await User.find();
        const orders = await Order.find().populate('items.product').sort({ orderDate: -1 });
        const products = await Products.find();
        const categories = await Category.find(); // Ensure the correct model is used
        
        const currentDate = new Date().toISOString().split('T')[0];

   
        const paidOrders = orders.filter(order => order.paymentStatus === "Paid");
        const filteredOrders = orders.filter(order => order.paymentStatus !== "Failed" && order.status !== "Cancelled");
        
        
        let revenue = 0;
        paidOrders.forEach(order => {
            revenue += order.totalPrice;
        });

     
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

            ordersPie:ordersPie,
            ordersGraph: ordersGraph,
            ordersYearGraph: ordersYearGraph,
           
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

    async function chart() {
        try {
            const orders = await Order.find();
            const paymentMethods = {
                cashOnDelivery: 'COD',
                razorPay: 'Razorpay',
                wallet: 'Wallet'
            };
            const ordersCount = {
                cashOnDelivery: 0,
                razorPay: 0,
                wallet: 0
            };

            orders.forEach(order => {
                if (order.paymentMethod === paymentMethods.cashOnDelivery) {
                    ordersCount.cashOnDelivery++;
                } else if (order.paymentMethod === paymentMethods.razorPay) {
                    ordersCount.razorPay++;
                } else if (order.paymentMethod === paymentMethods.wallet) {
                    ordersCount.wallet++;
                }
            });

            return ordersCount;
        } 
        catch (error) {
            console.error("An error occurred in the chart function:", error.message);
            throw error;
        }
    }



    async function monthgraph() {
        try {
            const ordersCountByMonth = await Order.aggregate([
                {
                    $project: {
                        yearMonth: {
                            $dateToString: {
                                format: "%Y-%m",
                                date: "$orderDate"
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$yearMonth",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
    
            const labels = ordersCountByMonth.map(val => val._id);
            const count = ordersCountByMonth.map(val => val.count);
    
            return {
                labels: labels,
                count: count
            };
        } catch (error) {
            console.log('Error retrieving orders in monthgraph function:', error.message);
            throw error;
        }
    }
    


    async function yeargraph() {
        try {
            const ordersCountByYear = await Order.aggregate([
                {
                    $project: {
                        year: { $year: { date: '$orderDate' } },
                    },
                },
                {
                    $group: {
                        _id: '$year',
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);
    
            const labels = ordersCountByYear.map((val) => val._id.toString());
            const count = ordersCountByYear.map((val) => val.count);
    
            return {
                labels: labels,
                count: count
            };
        } catch (error) {
            console.log('Error retrieving orders in yeargraph function:', error.message);
            throw error;
        }



}



module.exports = adminController;







