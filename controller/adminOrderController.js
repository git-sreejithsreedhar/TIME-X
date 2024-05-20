const Products  = require('../model/products')
const Brand = require('../model/brand')
const Order = require('../model/order')
const Coupon = require('../model/coupon')

const isAdmin = require('../middlewares/isAdmin')

const adminOrderController = {

    getOrder: async (req, res, next) => {
        try{

            const currentPage = parseInt(req.query.page) || 1; 
            const limit = 10 
            const skip = (currentPage - 1) * limit;

            const totalItems = await Order.countDocuments()
            const totalPages = Math.ceil(totalItems / limit)

            const orders = await Order.find().skip(skip).limit(limit).sort({ orderDate : -1 })

            res.render('admin/orders',{
                title: 'Order',
                order: orders,
                totalPages,
                currentPage
            })

        }
        catch(error) {
            next(error)
        }
    },

    getOrderDetails: async (req, res, next) => {
        try {

            const orderId = req.params.Id
            const orders = await Order.findOne({ _id : orderId}).populate('items.product')
            
            res.render('admin/adminOrderDetails',{
                title: 'Order Details',
                order: orders,
            })

        }
        catch(error) {
            next(error)
        }
    },

    updateStatus: async (req, res, next) => {
        try {
            const { orderId, productId, selectedStatus } = req.body;
            const order = await Order.findById(orderId);
            const cancelProduct = order.items.find(item => item.product.toString() === productId)            


            const updatedOrder = await Order.findOneAndUpdate(
                { _id: orderId, 'items.product': productId },
                { $set: { 'items.$.status': selectedStatus } },
                { new: true }
            );

            if ( selectedStatus == 'Cancelled' || selectedStatus == 'Returned' ) {

                const orderItem = updatedOrder.items.find(item => item.product.toString() === productId);
                await Products.findByIdAndUpdate(productId, { $inc: { stock: orderItem.quantity } });
                selectedStatus.disabled = true;
                
            }

            
            if (updatedOrder) {

                return res.json({ success: true, updatedOrder });
                
            } else {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            

        }
        catch(error) {
            next(error)
        }
    },

    // get coupon
    getCoupon: async (req,res,next) => {
        try{
            const coupon = await Coupon.find()

            res.render('admin/coupon',{
                title:'Coupon',
                coupon: coupon
            })

        }
        catch(err){
            next(err)
        }
    },

    getAddCoupon: async (req, res, next) => {
        try {
            res.render('admin/addCoupon',{
                title: 'Add Coupon'
            })
        }
        catch (error) {
            next (error)
        }
    },

    postAddCoupon: async (req,res,next)=>{
        try{
            const existingcoupon = await Coupon.findOne({coupon:req.body.coupon})
            if(existingcoupon){
                res.render('admin/addcoupon',{
                    title:'Add Coupon',
                    alert: 'Coupon is alredy exist, try with other Coupon'
                })
            }
            else{
                const coupon = new Coupon({
                    coupon: req.body.coupon,
                    description: req.body.description,
                    percentage: req.body.percentage,
                    minimumamount: req.body.minimumamount,
                    maximumamount: req.body.maximumamount,
                    expiryDate: req.body.expiryDate
                })
                await coupon.save()
                res.redirect('/admin/coupon')
            }
        }
        catch(err){
            next(err)
        }
    },

//publish and unpublish coupon
// unpublishcoupon: async (req,res,next)=>{
//     try{
//         const Id = req.params.Id
//         await Coupon.findByIdAndUpdate(Id, { isListed: false })
//         res.redirect('/admin/coupon')
//     }
//     catch(err){
//         next(err)
//     }
// },
// publishcoupon: async (req,res,next)=>{
//     try{
//         const Id = req.params.Id
//         await Coupon.findByIdAndUpdate(Id, { isListed: true })
//         res.redirect('/admin/coupon')
//     }
//     catch(err){
//         next(err)
//     }
// },


pubUnpub: async (req, res, next) => {
    try {
        const Id = req.params.Id;
        const coupon = await Coupon.findById(Id);

        if (!coupon) {
            return res.status(404).send('Coupon not found');
        }

        if (coupon.isListed === true) {
            await Coupon.findByIdAndUpdate(Id, { isListed: false });
            res.sendStatus(200);
        } else {
            await Coupon.findByIdAndUpdate(Id, { isListed: true });
            res.sendStatus(200);
        }
    } catch (error) {
        next(error);
    }
}







}

module.exports = adminOrderController
