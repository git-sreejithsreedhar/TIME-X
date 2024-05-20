const User = require('../model/user');
const Products  = require('../model/products')
const Brand = require('../model/brand')
const Order = require('../model/order')

const customerController = {

    getCustomerdetails: async (req, res, next) => {
        try {

            const currentPage = parseInt(req.query.page) || 1; 
            const limit = 10 
            const skip = (currentPage - 1) * limit;

            const totalItems = await User.countDocuments()
            const totalPages = Math.ceil(totalItems / limit)
            
            const order = await Order.findById().populate('items')
            const users = await User.find().skip(skip).limit(limit)
            res.render('admin/customer',{
                title :'Customers List',
                users : users,
                totalPages,
                currentPage
                // Order: Order
            })

        }
        catch(error) {
            next(error)
        }
    },

    
// Block Customer-------------------
    blockuser: async(req,res,next)=>{
        try{
            const userId = req.params.userId
            req.session.user = null
            req.user = null
            
            await User.findByIdAndUpdate(userId, { isBlocked: true })
            res.redirect('/admin/customer')
        }
        catch(err){
            next(err)
        }
    },


//  Unblock Customer-----------------------
unblockuser: async(req,res,next)=>{
    try{
        const userId = req.params.userId
        await User.findByIdAndUpdate(userId, { isBlocked: false })
        res.redirect('/admin/customer')
    }
    catch(err){
        next(err)
    }
}


}

module.exports = customerController;