
const { application } = require('express');
const Brand = require('../model/brand');
const Category = require('../model/category');
const Products = require('../model/products');



const multer = require('multer')
const sharp = require('sharp')





const storage = multer.diskStorage({
    destination:'public/product_images',
    filename:(req ,file, cb)=>{
        const uniqueSuffex = Date.now() + '-' + Math.round ( Math.random() * 1e9)
        cb(null,uniqueSuffex + '-' + file.originalname)
    }
})

const fileFilter = (req,res,cb)=>{
    cb(null,true)
}

const upload = multer({
    storage:storage,
    fileFilter:fileFilter
})



const productController = {

   //get products----------------------------------
   getproducts:async(req, res, next)=>{
    try{
        
        const products = await Products.find().populate('category').populate('brand');

        res.render('admin/products',{
            title :'Product Lists',
            products : products,
            brand: Brand
        })
    }
    catch(err){
        next(err)
    }
},
//get add products-----------------------

    getAddProducts: async(req, res, next) => {
        try{
            const category = await Category.find()
            const brands = await Brand.find() 
            res.render('admin/addProduct', {
                title: 'Add Products',
                brands: brands,
                categories: category
            })
        }
        catch(err){
            next(err)
        }
    },
//post add products--------------------------

postAddProducts:(req,res,next)=>{
    try{
        upload.array('images')(req,res,async(err)=>{
            if(err){
                return res.json({message:err.message, type:'danger'})
            }
            const images = req.files.map((file)=>`/product_images/${file.filename}`)

            const discount = Math.floor(((req.body.oldprice - req.body.price)/req.body.oldprice) * 100)

            const product = new Products({
                productname:req.body.productname,
                description:req.body.description,
                category:req.body.category,
                productDiscount:discount,
                brand:req.body.brand,
                stock:req.body.stock,
                colour:req.body.colour,
                price:req.body.price,
                oldprice: req.body.oldprice,
                description:req.body.description,
                images:images
            })

            await product.save()
            res.redirect('/admin/products')
        })
    }
    catch(err){
        next(err)
    }
},

//publish and unpublish product

unpublishProduct: async(req, res, next) => {
    try{
        const Id =req.params.Id
        await Products.findByIdAndUpdate(Id, {ispublished: false})
        res.redirect('/admin/products')
    }
    catch(err){
        next(err)
    }
},

publishProduct:async (req, res, next)=>{
    try{
        const Id = req.params.Id
        await Products.findByIdAndUpdate(Id, { ispublished: true })
        res.redirect('/admin/products')
    }
    catch(err){
        next(err)
    }
},


//get edit products--------------------------

// getEditProducts:async(req, res, next) => {
//     try{
//                 const Id = req.params.Id
//                 const product = await Products.findById(Id)
//                 console.log(product.images[0]);
              


//                 if(!product){
//                     redirect('/admin/product')
//                 } else {
//                     const brand = await Brand.find()
//                 const category = await Category.find()
                
//                 res.render('admin/editProduct',{
//                     title:'Edit Product',
//                     brands : brand,
//                     categories : category,
//                     product,
//                     proimg1: product.images[0]

//                 })

//                 }

                
                
//             }
//             catch(err){
//                 next(err)
//             }
//         },

getEditProducts: async (req, res, next) => {
    try {
        const Id = req.params.Id;
        const product = await Products.findById(Id);

        if (!product) {
            return res.redirect('/admin/products'); // Corrected redirect URL
        } else {
            const brands = await Brand.find();
            const categories = await Category.find();
            
            res.render('admin/editProduct', {
                title: 'Edit Product',
                brands,
                categories,
                product,
                proimg1: product.images[0]
            });
        }
    } catch (err) {
        next(err);
    }
},




// Updated postEditProduct controller function

// postEditProduct :async (req, res) => {
//     const id = req.params.Id;

//     try {
//         upload.array('images')(req, res, async (err) => {
//             if (err) {
//                 return res.json({ message: err.message, type: 'danger' });
//             }

//             const images = req.files.map((file)=>`/product_images/${file.filename}`)

//             console.log(images,"234234");   


//             const result = {
//                 product: req.body.productname,
//                 description: req.body.description,
//                 brand: req.body.brand,
//                 category: req.body.category,
//                 price: req.body.price,
//                 oldprice: req.body.oldprice,
//                 stock: req.body.stock,
//                 images: images
//             };

//             console.log(result)

//             if(images.length > 0){
//                 result.images = images
//             }else{
//                 console.log("There is no products");
//             }

//             const updateProduct = await Products.findByIdAndUpdate(id,result, {new: true})

//             res.redirect('/admin/products');
//         });
//     } catch (err) {
//         console.error(err);
//         res.json({ message: err.message, type: 'danger' });
//     }
// },

postEditProduct: async (req, res) => {
    const id = req.params.Id;

    try {
        upload.array('images')(req, res, async (err) => {
            if (err) {
                return res.json({ message: err.message, type: 'danger' });
            }

            const existingProduct = await Products.findById(id);

            // Get the new images if any, or use existing images
            const images = req.files.length > 0 ? req.files.map(file => `/product_images/${file.filename}`) : existingProduct.images;

            const result = {
                productname: req.body.productname || existingProduct.productname,
                description: req.body.description || existingProduct.description,
                brand: req.body.brand || existingProduct.brand,
                category: req.body.category || existingProduct.category,
                price: req.body.price || existingProduct.price,
                oldprice: req.body.oldprice || existingProduct.oldprice,
                stock: req.body.stock || existingProduct.stock,
                images: images
            };

            const updateProduct = await Products.findByIdAndUpdate(id, result, { new: true });

            res.redirect('/admin/products');
        });
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
},



        // postEditProduct:async(req,res,next)=>{
        //     try{
        //         upload.array('images')(req,res,async(err)=>{
        //             if(err){
        //                 return res.json({message:err.message, type:'danger'})
        //             }
    
        //             const images = req.files.map((file)=>`/product_images/${file.filename}`)
        //             const Id = req.params.Id
    
        //                const result =  await Products.findByIdAndUpdate(Id,{
        //                     productname:req.body.productname,
        //                     description:req.body.description,
        //                     category:req.body.category,
        //                     brand:req.body.brand,
        //                     stock:req.body.stock,
        //                     colour:req.body.colour,
        //                     price:req.body.price,
        //                     oldprice:req.body.oldprice,
        //                     images:images
        //                 })
                            
        //                     res.redirect('/admin/product')
        //                 })
        //             }
                
            
        //     catch(err){
        //         next(err)
        //     }
        // },

    }




module.exports = productController;