
const Products  = require('../model/products')
const Brand = require('../model/brand')

const brandController = {
//get brand--------------------------------------
    getbrand: async (req,res,next)=>{
        try{
            const brand = await Brand.find()
            res.render('admin/brand',{
                title:'Brands',
                brand:brand
            })
        }
        catch(err){
            next(err)
        }
    },

    //get add brand-------------------------------
    getaddBrand: async (req,res,next)=>{
        try{
            res.render('admin/addBrand',{
                title:'Add Brand'
            })
        }
        catch(err){
            next(err)
        }
    },

//post add brand-----------------------------------
    postaddbrand:async (req,res,next)=>{
        try{
            const existingbrand = await Brand.findOne({brand:req.body.brand})
            if(existingbrand){
                res.render('admin/addBrand',{
                    title:'Add Brand',
                    alert: 'Brand is alredy exist, try with other Brand'
                })
            }
            else{
                const brand = new Brand({
                    brand: req.body.brand,
                    description: req.body.description
                })
                await brand.save()
                res.redirect('/admin/brand')
            }
        }
        catch(err){
            next(err)
        }
    },

    //edit brand------------------------------------------
    getEditbrand: async(req,res,next)=>{
        try{
            const Id = req.params.Id
            const brand = await Brand.findById(Id)
            res.render('admin/editBrand',{
                title:'Edit Brand',
                brand : brand
            })
        }
        catch(err){
            next(err)
        }
    },

//post edit brand----------------------------------------
    postEditbrand: async(req,res,next)=>{
        try{
            const Id = req.params.Id
            await Brand.findByIdAndUpdate(Id, {
                brand: req.body.brand,
                description: req.body.description
            })
            res.redirect('/admin/brand')
        }
        catch(err){
            next(err)
        }
    },

     //publish brand ----------------------------------
     publishbrand:async (req,res,next)=>{
        try{
            const Id = req.params.Id
            await Brand.findByIdAndUpdate(Id, { isListed: true })
            res.redirect('/admin/brand')
        }
        catch(err){
            next(err)
        }
    },

    //unpublish brand---------------------------------
    unpublishbrand:async (req,res,next)=>{
        try{
            const Id = req.params.Id
            await Brand.findByIdAndUpdate(Id, { isListed: false })
            res.redirect('/admin/brand')
        }
        catch(err){
            next(err)
        }
    },

   

}

module.exports = brandController